package com.swiftshop.controller;

import com.swiftshop.common.domain.SearchFiltersDTO;
import com.swiftshop.domain.po.Item;
import com.swiftshop.service.IItemService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

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
    void normalizeSortByFallsBackForUnknownColumn() {
        assertEquals("update_time", SearchController.normalizeSortBy("id;drop table item"));
        assertEquals("update_time", SearchController.normalizeSortBy(""));
        assertEquals("update_time", SearchController.normalizeSortBy(null));
        assertEquals("sold", SearchController.normalizeSortBy("sold"));
    }

    @Test
    void filtersReturnDistinctNonBlankFacets() {
        List<String> categories = SearchController.cleanFilterValues(
                List.of(new Item().setCategory("  手机 "), new Item().setCategory("手机"),
                        new Item().setCategory(" "), new Item().setCategory(null)),
                Item::getCategory);

        assertEquals(List.of("手机"), categories);
        assertTrue(categories.stream().noneMatch(String::isBlank));
    }

    @Test
    void filtersEndpointReturnsCategoryAndBrandArrays() {
        when(itemService.list(any())).thenReturn(
                List.of(new Item().setCategory("手机")),
                List.of(new Item().setBrand("Swift"))
        );

        SearchFiltersDTO filters = controller.filters(null);

        assertEquals(List.of("手机"), filters.getCategories());
        assertEquals(List.of("Swift"), filters.getBrands());
    }
}
