package com.swiftshop.common.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collections;
import java.util.List;

/**
 * 搜索页可用的分类和品牌过滤项。
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchFiltersDTO {
    private List<String> categories = Collections.emptyList();
    private List<String> brands = Collections.emptyList();
}
