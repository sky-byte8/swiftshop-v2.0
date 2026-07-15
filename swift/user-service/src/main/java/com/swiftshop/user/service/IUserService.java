package com.swiftshop.user.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.swiftshop.user.domain.po.User;
import com.swiftshop.user.domain.vo.UserLoginVO;
import com.swiftshop.user.domain.dto.LoginFormDTO;

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
