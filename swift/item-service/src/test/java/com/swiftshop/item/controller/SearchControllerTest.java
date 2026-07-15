package com.swiftshop.item.controller;

import com.swiftshop.common.domain.SearchFiltersDTO;
import com.swiftshop.item.domain.po.Item;
import com.swiftshop.item.service.IItemService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SearchControllerTest {

    @Mock
    private IItemService itemService;

    @InjectMocks
    private SearchController controller;

    @Test
    void normalizeSortByOnlyAllowsSupportedColumns() {
        assertEquals("update_time", SearchController.normalizeSortBy(null));
        assertEquals("update_time", SearchController.normalizeSortBy("name"));
        assertEquals("update_time", SearchController.normalizeSortBy("price desc"));
        assertEquals("price", SearchController.normalizeSortBy("price"));
        assertEquals("sold", SearchController.normalizeSortBy("sold"));
    }

    @Test
    void filtersRemoveBlankValuesAndCapEachFacet() {
        List<Item> categories = IntStream.range(0, 25)
                .mapToObj(i -> new Item().setCategory("Category " + i))
                .collect(Collectors.toCollection(ArrayList::new));
        categories.add(new Item().setCategory(" "));
        categories.add(new Item().setCategory(null));
        List<String> categoryValues = SearchController.cleanFilterValues(categories, Item::getCategory);

        assertEquals(20, categoryValues.size());
        assertTrue(categoryValues.stream().noneMatch(String::isBlank));
    }

    @Test
    void filtersEndpointReturnsCategoryAndBrandArrays() {
        when(itemService.list(any())).thenReturn(
                List.of(new Item().setCategory("手机")),
                List.of(new Item().setBrand("Swift"))
        );

        SearchFiltersDTO filters = controller.filters("phone");

        assertEquals(List.of("手机"), filters.getCategories());
        assertEquals(List.of("Swift"), filters.getBrands());
    }
}
