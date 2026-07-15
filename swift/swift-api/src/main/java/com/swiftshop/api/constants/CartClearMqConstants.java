package com.swiftshop.api.constants;

public final class CartClearMqConstants {

    public static final String EXCHANGE_NAME = "trade.topic";
    public static final String ROUTING_KEY = "order.create";
    public static final String QUEUE_NAME = "cart.clear.queue";

    private CartClearMqConstants() {
    }
}
