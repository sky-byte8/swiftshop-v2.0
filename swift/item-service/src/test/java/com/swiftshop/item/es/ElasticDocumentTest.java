package com.swiftshop.item.es;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.swiftshop.common.domain.R;
import com.swiftshop.item.domain.po.Item;
import com.swiftshop.item.domain.po.ItemDoc;
import com.swiftshop.item.service.IItemService;
import com.swiftshop.item.service.impl.ItemServiceImpl;
import org.apache.http.HttpHost;
import org.elasticsearch.action.admin.indices.delete.DeleteIndexRequest;
import org.elasticsearch.action.bulk.BulkRequest;
import org.elasticsearch.action.delete.DeleteRequest;
import org.elasticsearch.action.get.GetRequest;
import org.elasticsearch.action.get.GetResponse;
import org.elasticsearch.action.index.IndexRequest;
import org.elasticsearch.action.update.UpdateRequest;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.common.xcontent.XContentType;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.IOException;
import java.util.List;

@SpringBootTest(properties = "spring.profiles.active=local")
public class ElasticDocumentTest {
    private RestHighLevelClient client;

    @Autowired
    private IItemService itemService;

    @Test
    void testIndexDoc() throws IOException {
        Item item= itemService.getById(100000011127L);
        ItemDoc itemDoc=BeanUtil.copyProperties(item, ItemDoc.class);
        IndexRequest request=new IndexRequest("items").id(itemDoc.getId());
        request.source(JSONUtil.toJsonStr(itemDoc), XContentType.JSON);
        client.index(request, RequestOptions.DEFAULT);
    }
    @Test
    void testBulkDoc() throws IOException {
        int pageNo=1,pageSize=500;
        while(true){
            Page<Item> page=itemService.lambdaQuery()
                    .eq(Item::getStatus,1)
                    .page(Page.of(pageNo,pageSize));
            List<Item> records=page.getRecords();
            if(records==null||records.isEmpty()){
                return;
            }
            BulkRequest request=new BulkRequest();
            for(Item item:records){
                request.add(new IndexRequest("items")
                        .id(item.getId().toString())
                        .source(JSONUtil.toJsonStr(BeanUtil.copyProperties(item, ItemDoc.class)),
                                XContentType.JSON)
                );
            }
            client.bulk(request,RequestOptions.DEFAULT);
            pageNo++;
        }
    }

    @Test
    void testGetDoc() throws IOException {
        GetRequest request=new GetRequest("items","100000011127");
        GetResponse response=client.get(request,RequestOptions.DEFAULT);
        String json=response.getSourceAsString();
        ItemDoc doc=JSONUtil.toBean(json,ItemDoc.class);
        System.out.println(doc);
    }
    @Test
    void testDeleteDoc() throws IOException {
        DeleteRequest request=new DeleteRequest("items","100000011127");
        client.delete(request, RequestOptions.DEFAULT);
    }
    @Test
    void testUpdateDoc() throws IOException {
        UpdateRequest request=new UpdateRequest("items","100000011127");
        request.doc(
                "price",61800
        );
        client.update(request, RequestOptions.DEFAULT);
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
