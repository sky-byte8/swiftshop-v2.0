package com.swiftshop.api.client.fallback;

import com.swiftshop.api.client.ItemClient;
import com.swiftshop.api.dto.ItemDTO;
import com.swiftshop.api.dto.OrderDetailDTO;
import com.swiftshop.common.utils.CollUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FallbackFactory;

import java.util.Collection;
import java.util.List;

@Slf4j
public class ItemClientFallbackFactory implements FallbackFactory<ItemClient> {
    @Override
    public ItemClient create(Throwable cause){
        return new ItemClient() {
            @Override
            public List<ItemDTO> queryItemByIds(Collection<Long> ids) {
                log.info("查询商品失败！",cause);
                return CollUtils.emptyList();
            }

            @Override
            public void deductStock(List<OrderDetailDTO> items) {
                log.info("扣减商品库存失败！",cause);
                throw new RuntimeException(cause);
            }

            @Override
            public void updateItem(ItemDTO item) {
                log.info("更新失败！",cause);
                throw new RuntimeException(cause);
            }
        };
    }

}
