package com.swiftshop.trade.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.swiftshop.api.po.Order;
import com.swiftshop.trade.domain.dto.OrderFormDTO;

/**
 * <p>
 *  服务类
 * </p>
 *
 * @since 2023-05-05
 */
public interface IOrderService extends IService<Order> {

    Long createOrder(OrderFormDTO orderFormDTO);

    void markOrderPaySuccess(Long orderId);

    void cancelOrder(Long orderId);

}
