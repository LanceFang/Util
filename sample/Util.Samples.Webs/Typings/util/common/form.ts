﻿//============== 表单操作 ========================
//Copyright 2018 何镇汐
//Licensed under the MIT license
//================================================
import { NgForm } from '@angular/forms';
import { FailResult } from '../core/result';
import { HttpMethod } from '../angular/http-helper';
import { WebApi } from './webapi';
import { RouterHelper } from '../angular/router-helper';
import { Message } from './message';
import { MessageConfig } from '../config/message-config';
import { Dialog } from './dialog';
import { IButton } from '../material/button-wrapper.component';

/**
 * 表单操作
 */
export class Form {
    /**
     * 提交表单
     * @param options 表单提交参数
     */
    submit(options: IFormSubmitOption): void {
        if (!this.validateSubmit(options))
            return;
        if (!options.confirm) {
            this.submitForm(options);
            return;
        }
        Message.confirm({
            title: options.confirmTitle,
            message: options.confirm,
            ok: () => this.submitForm(options),
            cancel: options.completeHandler
        });
    }

    /**
     * 提交表单验证
     */
    private validateSubmit(options: IFormSubmitOption) {
        if (!options) {
            Message.error("表单参数 options: FormSubmitOptions 未设置");
            return false;
        }
        if (options.form && !options.form.valid)
            return false;
        if (!options.url) {
            Message.error("表单url未设置");
            return false;
        }
        if (!options.data) {
            Message.error("表单数据未设置");
            return false;
        }
        return true;
    }

    /**
     * 提交表单
     */
    private submitForm(options: IFormSubmitOption) {
        this.initHttpMethod(options);
        WebApi.send(options.url, options.httpMethod, options.data)
            .header(options.header)
            .button(options.button)
            .loading(options.loading || false)
            .handle({
                beforeHandler: options.beforeHandler,
                handler: result => {
                    this.submitHandler(options, result);
                },
                failHandler: options.failHandler,
                completeHandler: options.completeHandler
            });
    }

    /**
     * 初始化Http方法
     * @param options
     */
    private initHttpMethod(options: IFormSubmitOption) {
        if (options.httpMethod)
            return;
        options.httpMethod = options.data.id ? HttpMethod.Put : HttpMethod.Post;
    }

    /**
     * 提交表单成功处理函数
     */
    private submitHandler(options: IFormSubmitOption, result) {
        options.handler && options.handler(result);
        if (options.showMessage !== false)
            Message.snack(MessageConfig.successed);
        if (options.back)
            RouterHelper.back();
        if (options.closeDialog)
            Dialog.close();
    }
}

/**
 * 表单提交参数
 */
export interface IFormSubmitOption {
    /**
     * 请求地址
     */
    url: string;
    /**
     * 提交数据
     */
    data;
    /**
     * Http头
     */
    header?: { name: string, value }[];
    /**
     * Http方法
     */
    httpMethod?: HttpMethod;
    /**
     * 确认消息,设置该项则提交前需要确认
     */
    confirm?: string;
    /**
     * 确认标题
     */
    confirmTitle?: string;
    /**
     * 表单
     */
    form?: NgForm;
    /**
     * 按钮实例，在请求期间禁用该按钮
     */
    button?: IButton,
    /**
     * 按钮被禁用时显示的文本，默认值：loading...
     */
    buttonDisabledText?: string,
    /**
     * 请求时显示进度条，默认为false
     */
    loading?: boolean,
    /**
     * 提交成功后是否显示成功提示，默认为true
     */
    showMessage?: boolean;
    /**
     * 提交成功后是否返回上一个视图，默认为false
     */
    back?: boolean;
    /**
     * 提交成功后关闭弹出层，当在弹出层中编辑时使用，默认为false
     */
    closeDialog?: boolean;
    /**
     * 提交前处理函数，返回false则取消提交
     */
    beforeHandler?: () => boolean;
    /**
     * 提交成功处理函数
     */
    handler?: (result) => void;
    /**
     * 提交失败处理函数
     */
    failHandler?: (result: FailResult) => void;
    /**
     * 操作完成处理函数，注意：该函数在任意情况下都会执行
     */
    completeHandler?: () => void;
}