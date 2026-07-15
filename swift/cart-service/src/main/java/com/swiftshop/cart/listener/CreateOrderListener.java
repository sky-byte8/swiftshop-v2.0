package com.swiftshop.cart.listener;

import com.swiftshop.api.constants.CartClearMqConstants;
import com.swiftshop.api.dto.CartClearMessage;
import com.swiftshop.cart.service.ICartService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.ExchangeTypes;
import org.springframework.amqp.rabbit.annotation.Exchange;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.QueueBinding;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CreateOrderListener {
    private final ICartService iCartService;
    private final MessageConverter messageConverter;

    @RabbitListener(bindings = @QueueBinding(
            value = @Queue(name = CartClearMqConstants.QUEUE_NAME,durable = "true"),
            exchange = @Exchange(name = CartClearMqConstants.EXCHANGE_NAME,type = ExchangeTypes.TOPIC),
            key = CartClearMqConstants.ROUTING_KEY
    ))
    public void listenCreateOrder(Message message){
        handlePayload(messageConverter.fromMessage(message));
    }

    void handlePayload(Object payload) {
        CartClearMessage message = normalizeMessage(payload);
        if (message.getUserId() == null || message.getItemIds() == null || message.getItemIds().isEmpty()) {
            return;
        }
        iCartService.removeByUserIdAndItemIds(message.getUserId(), List.copyOf(message.getItemIds()));
    }

    private CartClearMessage normalizeMessage(Object payload) {
        if (payload instanceof CartClearMessage) {
            return (CartClearMessage) payload;
        }
        if (payload instanceof Map) {
            return normalizeLegacyMessage((Map<?, ?>) payload);
        }
        throw new IllegalArgumentException("无法识别购物车清理消息类型：" +
                (payload == null ? "null" : payload.getClass().getName()));
    }

    private CartClearMessage normalizeLegacyMessage(Map<?, ?> payload) {
        if (payload.isEmpty()) {
            return new CartClearMessage(null, List.of());
        }
        if (payload.size() != 1) {
            throw new IllegalArgumentException("旧版购物车清理消息必须只包含一个用户");
        }
        Map.Entry<?, ?> entry = payload.entrySet().iterator().next();
        if (!(entry.getValue() instanceof Collection)) {
            throw new IllegalArgumentException("旧版购物车清理消息缺少商品集合");
        }
        List<Long> itemIds = ((Collection<?>) entry.getValue()).stream()
                .map(itemId -> toLong(itemId, "商品ID"))
                .collect(Collectors.toList());
        return new CartClearMessage(toLong(entry.getKey(), "用户ID"), itemIds);
    }

    private Long toLong(Object value, String fieldName) {
        if (value == null) {
            throw new IllegalArgumentException(fieldName + "不能为空");
        }
        try {
            return Long.valueOf(String.valueOf(value));
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(fieldName + "必须是整数：" + value, e);
        }

    }
}
