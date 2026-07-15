package com.swiftshop.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartClearMessage {

    private Long userId;

    private List<Long> itemIds;
}
