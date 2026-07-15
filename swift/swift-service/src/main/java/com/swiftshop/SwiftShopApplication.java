package com.swiftshop;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@MapperScan("com.swiftshop.mapper")
@SpringBootApplication
public class SwiftShopApplication {
    public static void main(String[] args) {
        SpringApplication.run(SwiftShopApplication.class, args);
    }
}