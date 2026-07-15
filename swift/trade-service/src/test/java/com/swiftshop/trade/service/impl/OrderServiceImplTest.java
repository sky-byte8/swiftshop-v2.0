package com.swiftshop.trade.service.impl;

import com.swiftshop.api.client.ItemClient;
import com.swiftshop.api.constants.CartClearMqConstants;
import com.swiftshop.api.dto.CartClearMessage;
import com.swiftshop.api.dto.ItemDTO;
import com.swiftshop.api.dto.OrderDetailDTO;
import com.swiftshop.api.po.Order;
import com.swiftshop.common.utils.UserContext;
import com.swiftshop.trade.domain.dto.OrderFormDTO;
import com.swiftshop.trade.service.IOrderDetailService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isA;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.when;

class OrderServiceImplTest {

    @AfterEach
    void clearUserContext() {
        UserContext.removeUser();
    }

    @Test
    void publishesCartClearMessageAfterStockDeduction() {
        ItemClient itemClient = mock(ItemClient.class);
        IOrderDetailService detailService = mock(IOrderDetailService.class);
        RabbitTemplate rabbitTemplate = mock(RabbitTemplate.class);
        OrderServiceImpl service = spy(new OrderServiceImpl(itemClient, detailService, rabbitTemplate));

        ItemDTO item = new ItemDTO();
        item.setId(101L);
        item.setPrice(2599);
        when(itemClient.queryItemByIds(any())).thenReturn(List.of(item));
        doReturn(true).when(service).save(any(Order.class));
        when(detailService.saveBatch(any())).thenReturn(true);
        doNothing().when(itemClient).deductStock(any());

        OrderDetailDTO detail = new OrderDetailDTO().setItemId(101L).setNum(2);
        OrderFormDTO form = new OrderFormDTO();
        form.setPaymentType(3);
        form.setDetails(List.of(detail));
        UserContext.setUser(41L);

        service.createOrder(form);

        ArgumentCaptor<CartClearMessage> message = ArgumentCaptor.forClass(CartClearMessage.class);
        InOrder events = inOrder(itemClient, rabbitTemplate);
        events.verify(itemClient).deductStock(eq(List.of(detail)));
        events.verify(rabbitTemplate).convertAndSend(
                eq(CartClearMqConstants.EXCHANGE_NAME),
                eq(CartClearMqConstants.ROUTING_KEY),
                message.capture());
        assertEquals(41L, message.getValue().getUserId());
        assertEquals(List.of(101L), message.getValue().getItemIds());
    }
}
