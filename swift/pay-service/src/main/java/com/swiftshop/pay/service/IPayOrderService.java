package com.swiftshop.pay.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.swiftshop.pay.domain.dto.PayApplyDTO;
import com.swiftshop.pay.domain.dto.PayOrderFormDTO;
import com.swiftshop.pay.domain.po.PayOrder;

/**
 * <p>
 * 支付订单 服务类
 * </p>
 *
 * @since 2023-05-16
 */
public interface IPayOrderService extends IService<PayOrder> {

    String applyPayOrder(PayApplyDTO applyDTO);

    void tryPayOrderByBalance(PayOrderFormDTO payOrderFormDTO);
}
