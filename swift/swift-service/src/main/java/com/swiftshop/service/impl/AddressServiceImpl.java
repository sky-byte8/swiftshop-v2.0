package com.swiftshop.service.impl;

import com.swiftshop.domain.po.Address;
import com.swiftshop.mapper.AddressMapper;
import com.swiftshop.service.IAddressService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

/**
 * <p>
 *  服务实现类
 * </p>
 *
 * @since 2023-05-05
 */
@Service
public class AddressServiceImpl extends ServiceImpl<AddressMapper, Address> implements IAddressService {

}
