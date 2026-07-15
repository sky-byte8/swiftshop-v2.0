package com.swiftshop.trade;

import com.swiftshop.api.client.ItemClient;
import com.swiftshop.api.client.PayClient;
import com.swiftshop.api.config.DefaultFeignConfig;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients(clients = {ItemClient.class, PayClient.class},defaultConfiguration = DefaultFeignConfig.class)
@MapperScan("com.swiftshop.trade.mapper")
@SpringBootApplication
public class OrderApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrderApplication.class, args);
    }


}
