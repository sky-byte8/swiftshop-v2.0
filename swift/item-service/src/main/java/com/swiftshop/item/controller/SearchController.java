package com.swiftshop.item.controller;


import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.swiftshop.common.domain.PageDTO;
import com.swiftshop.common.domain.SearchFiltersDTO;
import com.swiftshop.item.domain.dto.ItemDTO;
import com.swiftshop.item.domain.po.Item;
import com.swiftshop.item.domain.query.ItemPageQuery;
import com.swiftshop.item.service.IItemService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Api(tags = "搜索相关接口")
@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
public class SearchController {

    private static final String DEFAULT_SORT_FIELD = "update_time";
    private static final int MAX_FILTER_OPTIONS = 20;
    private static final Set<String> ALLOWED_SORT_FIELDS =
            Collections.unmodifiableSet(Set.of(DEFAULT_SORT_FIELD, "price", "sold"));

    private final IItemService itemService;

    @ApiOperation("搜索商品")
    @GetMapping("/list")
    public PageDTO<ItemDTO> search(ItemPageQuery query) {
        normalizeSort(query);
        // 分页查询
        Page<Item> result = itemService.lambdaQuery()
                .like(StrUtil.isNotBlank(query.getKey()), Item::getName, query.getKey())
                .eq(StrUtil.isNotBlank(query.getBrand()), Item::getBrand, query.getBrand())
                .eq(StrUtil.isNotBlank(query.getCategory()), Item::getCategory, query.getCategory())
                .eq(Item::getStatus, 1)
                .between(query.getMaxPrice() != null, Item::getPrice, query.getMinPrice(), query.getMaxPrice())
                .page(query.toMpPage("update_time", false));
        // 封装并返回
        return PageDTO.of(result, ItemDTO.class);
    }

    @ApiOperation("查询搜索过滤项")
    @GetMapping("/filters")
    public SearchFiltersDTO filters(@RequestParam(value = "key", required = false) String key) {
        return new SearchFiltersDTO(
                queryCategories(key),
                queryBrands(key)
        );
    }

    static String normalizeSortBy(String sortBy) {
        return sortBy != null && ALLOWED_SORT_FIELDS.contains(sortBy) ? sortBy : DEFAULT_SORT_FIELD;
    }

    private static void normalizeSort(ItemPageQuery query) {
        String requestedSort = query.getSortBy();
        query.setSortBy(normalizeSortBy(requestedSort));
        // Keep the historical default (newest first) when no supported field was requested.
        if (requestedSort == null || !ALLOWED_SORT_FIELDS.contains(requestedSort)) {
            query.setIsAsc(false);
        }
    }

    private List<String> queryCategories(String key) {
        QueryWrapper<Item> query = buildFilterQuery(key);
        query.select("category")
                .isNotNull("category")
                .ne("category", "")
                .groupBy("category")
                .orderByAsc("category");
        query.last("LIMIT " + MAX_FILTER_OPTIONS);
        return cleanFilterValues(itemService.list(query), Item::getCategory);
    }

    private List<String> queryBrands(String key) {
        QueryWrapper<Item> query = buildFilterQuery(key);
        query.select("brand")
                .isNotNull("brand")
                .ne("brand", "")
                .groupBy("brand")
                .orderByAsc("brand");
        query.last("LIMIT " + MAX_FILTER_OPTIONS);
        return cleanFilterValues(itemService.list(query), Item::getBrand);
    }

    private QueryWrapper<Item> buildFilterQuery(String key) {
        QueryWrapper<Item> query = new QueryWrapper<>();
        query.eq("status", 1);
        if (StrUtil.isNotBlank(key)) {
            String keyword = key.trim();
            query.and(wrapper -> wrapper
                    .like("name", keyword)
                    .or().like("category", keyword)
                    .or().like("brand", keyword));
        }
        return query;
    }

    static List<String> cleanFilterValues(List<Item> items, Function<Item, String> valueGetter) {
        if (items == null || items.isEmpty()) {
            return Collections.emptyList();
        }
        return items.stream()
                .map(valueGetter)
                .filter(StrUtil::isNotBlank)
                .map(String::trim)
                .distinct()
                .limit(MAX_FILTER_OPTIONS)
                .collect(Collectors.toList());
    }
}
