package com.swiftshop.service;

import com.swiftshop.domain.dto.PayApplyDTO;
import com.swiftshop.domain.dto.PayOrderFormDTO;
import com.swiftshop.domain.po.PayOrder;
import com.baomidou.mybatisplus.extension.service.IService;

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
