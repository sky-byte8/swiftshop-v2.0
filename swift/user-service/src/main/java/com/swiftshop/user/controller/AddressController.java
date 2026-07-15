package com.swiftshop.user.controller;

import com.swiftshop.common.exception.BadRequestException;
import com.swiftshop.common.utils.BeanUtils;
import com.swiftshop.common.utils.CollUtils;
import com.swiftshop.common.utils.UserContext;
import com.swiftshop.user.domain.dto.AddressDTO;
import com.swiftshop.user.domain.po.Address;
import com.swiftshop.user.service.IAddressService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/addresses")
@RequiredArgsConstructor
@Api(tags = "收货地址管理接口")
public class AddressController {

    private final IAddressService addressService;

    @ApiOperation("根据id查询当前用户地址")
    @GetMapping("{addressId}")
    public AddressDTO findAddressById(@ApiParam("地址id") @PathVariable("addressId") Long id) {
        Address address = addressService.getById(id);
        Long userId = UserContext.getUser();
        if (address == null || !address.getUserId().equals(userId)) {
            throw new BadRequestException("地址不属于当前登录用户");
        }
        return BeanUtils.copyBean(address, AddressDTO.class);
    }

    @ApiOperation("查询当前用户地址列表")
    @GetMapping
    public List<AddressDTO> findMyAddresses() {
        List<Address> addresses = addressService.lambdaQuery()
                .eq(Address::getUserId, UserContext.getUser())
                .list();
        return CollUtils.isEmpty(addresses)
                ? CollUtils.emptyList()
                : BeanUtils.copyList(addresses, AddressDTO.class);
    }
}
