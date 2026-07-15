package com.swiftshop.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.swiftshop.domain.dto.LoginFormDTO;
import com.swiftshop.domain.po.User;
import com.swiftshop.domain.vo.UserLoginVO;

/**
 * <p>
 * 用户表 服务类
 * </p>
 *
 * @since 2023-05-05
 */
public interface IUserService extends IService<User> {

    UserLoginVO login(LoginFormDTO loginFormDTO);

    void deductMoney(String pw, Integer totalFee);
}
