package com.swiftshop.cart.listener;

import com.swiftshop.api.dto.CartClearMessage;
import com.swiftshop.cart.service.ICartService;
import com.swiftshop.common.config.MqConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.MessageProperties;
import org.springframework.amqp.support.converter.MessageConverter;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

class CreateOrderListenerTest {

    private ICartService cartService;
    private CreateOrderListener listener;
    private MessageConverter converter;

    @BeforeEach
    void setUp() {
        cartService = mock(ICartService.class);
        converter = new MqConfig().messageConverter();
        listener = new CreateOrderListener(cartService, converter);
    }

    @Test
    void removesOnlyTheMessageUsersItems() {
        listener.listenCreateOrder(toMessage(new CartClearMessage(41L, List.of(101L, 102L))));

        verify(cartService).removeByUserIdAndItemIds(41L, List.of(101L, 102L));
    }

    @Test
    void acceptsLegacyJsonMapPayload() {
        listener.listenCreateOrder(toMessage(Map.of("41", List.of(101, 102))));

        verify(cartService).removeByUserIdAndItemIds(41L, List.of(101L, 102L));
    }

    @Test
    void duplicateMessagesRemainSafeForTheIdempotentDelete() {
        CartClearMessage message = new CartClearMessage(41L, List.of(101L));

        listener.listenCreateOrder(toMessage(message));
        listener.listenCreateOrder(toMessage(message));

        verify(cartService, times(2)).removeByUserIdAndItemIds(41L, List.of(101L));
    }

    @Test
    void ignoresMessagesWithoutItems() {
        listener.listenCreateOrder(toMessage(new CartClearMessage(41L, List.of())));

        verifyNoInteractions(cartService);
    }

    @Test
    void rejectsMalformedLegacyMessages() {
        assertThrows(IllegalArgumentException.class,
                () -> listener.listenCreateOrder(toMessage(Map.of("not-a-user", List.of(101)))));

        verifyNoInteractions(cartService);
    }

    @Test
    void jsonConverterPreservesTheSharedMessageTypeAndLongIds() {
        MessageConverter converter = new MqConfig().messageConverter();
        CartClearMessage original = new CartClearMessage(9000000001L, List.of(8000000001L));
        Message message = converter.toMessage(original, new MessageProperties());

        Object restored = converter.fromMessage(message);

        assertTrue(restored instanceof CartClearMessage);
        CartClearMessage result = (CartClearMessage) restored;
        assertEquals(original.getUserId(), result.getUserId());
        assertEquals(original.getItemIds(), result.getItemIds());
    }

    private Message toMessage(Object payload) {
        return converter.toMessage(payload, new MessageProperties());
    }
}
