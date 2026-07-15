package com.swiftshop.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.swiftshop.domain.dto.OrderDetailDTO;
import com.swiftshop.domain.po.Item;
import org.apache.ibatis.annotations.Update;

/**
 * <p>
 * 商品表 Mapper 接口
 * </p>
 *
 * @since 2023-05-05
 */
public interface ItemMapper extends BaseMapper<Item> {

    @Update("UPDATE item SET stock = stock - #{num} WHERE id = #{itemId}")
    void updateStock(OrderDetailDTO orderDetail);
}
