package com.swiftshop.item.es;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.swiftshop.item.domain.po.Item;
import com.swiftshop.item.domain.po.ItemDoc;
import com.swiftshop.item.service.IItemService;
import org.apache.http.HttpHost;
import org.elasticsearch.action.bulk.BulkRequest;
import org.elasticsearch.action.delete.DeleteRequest;
import org.elasticsearch.action.get.GetRequest;
import org.elasticsearch.action.get.GetResponse;
import org.elasticsearch.action.index.IndexRequest;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.action.update.UpdateRequest;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.common.xcontent.XContentType;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.SearchHit;
import org.elasticsearch.search.SearchHits;
import org.elasticsearch.search.aggregations.AggregationBuilder;
import org.elasticsearch.search.aggregations.AggregationBuilders;
import org.elasticsearch.search.aggregations.Aggregations;
import org.elasticsearch.search.aggregations.bucket.terms.Terms;
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.elasticsearch.search.fetch.subphase.highlight.HighlightField;
import org.elasticsearch.search.sort.SortOrder;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import javax.swing.text.Highlighter;
import java.io.IOException;
import java.util.List;
import java.util.Map;

//@SpringBootTest(properties = "spring.profiles.active=local")
public class ElasticSearchTest {
    private RestHighLevelClient client;

    @Test
    void testsMatchAll() throws IOException {
        SearchRequest request=new SearchRequest("items");
        request.source().query(QueryBuilders.matchAllQuery());
        SearchResponse response=client.search(request,RequestOptions.DEFAULT);
        System.out.println(response);

        parseResponseResult(response);
    }


    @Test
    void testSearch() throws IOException {
        SearchRequest request=new SearchRequest("items");

        request.source().query(
                QueryBuilders.boolQuery()
                        .must(QueryBuilders.matchQuery("name","脱脂牛奶"))
                        .filter(QueryBuilders.termQuery("brand","德亚"))
                        .filter(QueryBuilders.rangeQuery("price").lt(30000))
        );

        SearchResponse response=client.search(request,RequestOptions.DEFAULT);
        System.out.println(response);

        parseResponseResult(response);
    }
    @Test
    void testSortAndPage() throws IOException {
        int pageNo=1,pageSize=5;

        SearchRequest request=new SearchRequest("items");

        request.source().query(QueryBuilders.matchAllQuery());
        request.source().from((pageNo-1)*pageSize).size(pageSize);
        request.source()
                .sort("sold", SortOrder.DESC)
                .sort("price",SortOrder.ASC);

        SearchResponse response=client.search(request,RequestOptions.DEFAULT);
        System.out.println(response);

        parseResponseResult(response);
    }


    @Test
    void testHighlight() throws IOException {
        SearchRequest request=new SearchRequest("items");

        request.source().query(QueryBuilders.matchQuery("name","脱脂牛奶"));
        request.source().highlighter(SearchSourceBuilder.highlight().field("name"));

        SearchResponse response=client.search(request,RequestOptions.DEFAULT);
        System.out.println(response);

        parseResponseResult(response);
    }
    @Test
    void testAgg() throws IOException {
        SearchRequest request=new SearchRequest("items");

        request.source().size(0);
        String brandAggName="brandAgg";
        request.source().aggregation(
                AggregationBuilders.terms(brandAggName).field("brand").size(10)
        );


        SearchResponse response=client.search(request,RequestOptions.DEFAULT);
        System.out.println(response);

        Aggregations aggregations=response.getAggregations();
        Terms brandTerms=aggregations.get(brandAggName);
        List<? extends Terms.Bucket> buckets=brandTerms.getBuckets();
        for(Terms.Bucket bucket:buckets){
            System.out.println("brand:"+bucket.getKeyAsString());
            System.out.println("count:"+bucket.getDocCount());
        }
    }

    private static void parseResponseResult(SearchResponse response) {
        SearchHits searchHits= response.getHits();
        long total=searchHits.getTotalHits().value;
        System.out.println("total="+total);
        SearchHit[] hits=searchHits.getHits();
        for(SearchHit hit:hits){
            String json=hit.getSourceAsString();
            ItemDoc doc=JSONUtil.toBean(json, ItemDoc.class);
            Map<String, HighlightField> hfs=hit.getHighlightFields();
            if(hfs!=null&&!hfs.isEmpty()){
                HighlightField hf=hfs.get("name");
                String hfName=hf.getFragments()[0].string();
                doc.setName(hfName);
            }
            System.out.println("doc="+doc);
        }
    }


    @BeforeEach
    void setUp(){
        client=new RestHighLevelClient(RestClient.builder(
                HttpHost.create("192.168.121.128:9200")
        ));
    }


    @AfterEach
    void tearDown() throws IOException {
        if(client!=null){
            client.close();
        }
    }

}
