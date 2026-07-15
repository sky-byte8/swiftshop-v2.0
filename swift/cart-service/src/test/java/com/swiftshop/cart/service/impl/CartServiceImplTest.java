package com.swiftshop.cart.service.impl;

import com.baomidou.mybatisplus.extension.conditions.query.LambdaQueryChainWrapper;
import com.swiftshop.api.client.ItemClient;
import com.swiftshop.cart.config.CartProperties;
import com.swiftshop.cart.domain.dto.CartFormDTO;
import com.swiftshop.cart.domain.po.Cart;
import com.swiftshop.common.utils.UserContext;
import org.mockito.ArgumentCaptor;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CartServiceImplTest {

    @AfterEach
    void clearUserContext() {
        UserContext.removeUser();
    }

    @Test
    void queryMyCartsUsesCurrentUserInsteadOfFixedUser() {
        ItemClient itemClient = mock(ItemClient.class);
        CartProperties properties = new CartProperties();
        CartServiceImpl service = spy(new CartServiceImpl(itemClient, properties));
        LambdaQueryChainWrapper<Cart> query = mock(LambdaQueryChainWrapper.class);
        doReturn(query).when(service).lambdaQuery();
        when(query.eq(any(), eq(42L))).thenReturn(query);
        when(query.list()).thenReturn(Collections.emptyList());

        UserContext.setUser(42L);
        service.queryMyCarts();

        verify(query).eq(any(), eq(42L));
    }

    @Test
    void addItemUsesDefaultLimitAndInitialQuantityWhenQuantityIsMissing() {
        ItemClient itemClient = mock(ItemClient.class);
        CartServiceImpl service = spy(new CartServiceImpl(itemClient, new CartProperties()));
        LambdaQueryChainWrapper<Cart> query = mock(LambdaQueryChainWrapper.class);
        doReturn(query).when(service).lambdaQuery();
        when(query.eq(any(), any())).thenReturn(query);
        when(query.count()).thenReturn(0);
        doReturn(true).when(service).save(any(Cart.class));

        CartFormDTO form = new CartFormDTO();
        form.setItemId(100L);
        form.setName("商品");
        form.setNum(null);
        UserContext.setUser(42L);

        service.addItem2Cart(form);

        ArgumentCaptor<Cart> saved = ArgumentCaptor.forClass(Cart.class);
        verify(service).save(saved.capture());
        assertEquals(1, saved.getValue().getNum());
    }
}
