package com.swiftshop.cart.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "swift.cart")
public class CartProperties {
    /** Maximum number of distinct items a user can keep in the cart. */
    private Integer maxItems = 10;
}
