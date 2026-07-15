package com.swiftshop.pay;

import com.swiftshop.api.client.OrderClient;
import com.swiftshop.api.client.UserClient;
import com.swiftshop.api.config.DefaultFeignConfig;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients(clients = {OrderClient.class, UserClient.class},defaultConfiguration = DefaultFeignConfig.class)
@MapperScan("com.swiftshop.pay.mapper")
@SpringBootApplication
public class PayApplication {
    public static void main(String[] args) {
        SpringApplication.run(PayApplication.class, args);
    }
}