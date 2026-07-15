package com.swiftshop.api.client;

import com.swiftshop.api.client.fallback.ItemClientFallbackFactory;
import com.swiftshop.api.config.DefaultFeignConfig;
import com.swiftshop.api.dto.ItemDTO;
import com.swiftshop.api.dto.OrderDetailDTO;
import com.swiftshop.common.utils.BeanUtils;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Collection;
import java.util.List;

@FeignClient(value = "item-service",fallbackFactory = ItemClientFallbackFactory.class)
public interface ItemClient {
    @GetMapping("/items")
    List<ItemDTO> queryItemByIds(@RequestParam("ids") Collection<Long> ids);

    @PutMapping("/items/stock/deduct")
    void deductStock(@RequestBody List<OrderDetailDTO> items);

    @PutMapping()
    void updateItem(@RequestBody ItemDTO item);

}
