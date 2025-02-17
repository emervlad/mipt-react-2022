import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from "react-router-dom";

import {PageHeader, Tabs, Button, Statistic, Descriptions, Rate, Col, Row, Breadcrumb} from 'antd';
import {sumRating} from "./ProductsPage";

const { TabPane } = Tabs;

const tagTree = (tag, tagSample) => {
    let tKey = tagSample.find(t => t.key === tag);
    let tags = []
    while (tKey) {
        tags.push(tKey.title)
        tKey = tagSample.find(t => t.key === tKey.parent)
    }
    let routes = [{
        path: 'index', breadcrumbName: 'Home'
    }]
    tags.forEach((tag, index) => {
        routes.push({
            path: `${index + 1}`, breadcrumbName: tag
        })
    })
    return routes
}

const attributes = (title, attributes) => {
    let data = [
        <Descriptions.Item label="title">{title}</Descriptions.Item>
    ];
    for(let attribute in attributes) {
        data.push(<Descriptions.Item label={attribute}>{attributes[attribute]}</Descriptions.Item>)
    }
    return <Descriptions size="big" column={3}>
        {data}
    </Descriptions>
}

const ratings = (ratings) => {
    const [_sumAmount, _sumRating] = sumRating(ratings)
    let data = [<Col span={6} style={{
        width:120
    }}> <Statistic

        title="Ratings"
        value={"(" + _sumAmount + ")"}
        prefix={<Rate disabled allowHalf defaultValue={_sumRating}/>}
    />
    </Col>];
    for (let i = 0; i < ratings.length; i++) {
        data[i+1] = <Col span={6} style={{
            width:120
        }}> <Statistic
            title={ratings[i].rate}
            value={"("+ratings[i].amount+")"}
            prefix={<Rate disabled allowHalf defaultValue={ratings[i].rate}/>}
        />
        </Col>
    }
    return data
}

const sellOptions = (sellOptions) => {
    return sellOptions.map(option => (
        <Col key={option} span={6} style={{ width: 120 }}>
            <Statistic
                title={option.type + " price"}
                prefix={option.currency}
                value={option.price}
            />
        </Col>))
}

const Content = ({ children, extra, image }) => (
    <div className="content">
        <table width="100%" cellSpacing="0" cellPadding="0">
            <tr>
                <td className="leftcol">
                    <img
                        align="right"
                        width="200"
                        height="300"
                        style={{box: 100}}
                        src={image}
                    /></td>
                <td valign="top">{children}
                    <hr/>
                    {extra}
                </td>
            </tr>
        </table>
    </div>
);

const NotFountPage = (
    <div>
        <h2>404 Product not found</h2>
    </div>
);

export const LoadingPage = (
    <div>
        <h2>Loading...</h2>
    </div>
);

export const ProductPage = (props) => {
    const products = props.products
    const params = useParams();
    const navigate = useNavigate()

    const [product, setProduct] = useState(null)//products.find(p => p.usin === params.usin);
    const [tagSample, setTags] = useState(null)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() =>
        {

                setLoading(true);
                setError(null);
                let loadProd = true
                let loadTag = true
                fetch('https://ultimate-ecommerce.v-query.com/api/service-product/search/' + params.usin)
                    .then((response) => {
                        return response.json();
                    })
                    .then((data) => {
                        setProduct(data)
                    }).catch(err => {
                    setError(err);
                }).finally(() => {
                    loadProd = false
                    setLoading(loadProd || loadTag)
                });
                fetch('https://ultimate-ecommerce.v-query.com/api/service-product/tag')
                    .then((response) => {
                        return response.json();
                    })
                    .then((data) => {
                        setTags(data)
                }).catch(err => {
                    setError(err);
                })
                    .finally(() => {
                        loadTag = false
                        setLoading(loadProd || loadTag)
                    });
                } , [products])

    if (loading) {
        return LoadingPage
    }
    if (error) {
        return <div>
            <h2>{error}</h2>
        </div>
    }
    if (!product) {
        return NotFountPage
    }

    const extraContent = (

        <div
            style={{
                display: 'flex',
                width: 'max-content',
                justifyContent: 'flex-end',
            }}
        >
            <Row gutter={[16, 16]}>
                {sellOptions(product.sellOptions)}
                {ratings(product.ratings)}
            </Row>
        </div>
    );

    const routes = tagTree(product.tag, tagSample)
    return <PageHeader
        className="site-page-header-responsive"
        onBack={() => navigate("/products")}
        title="Product Card"
        subTitle={product.usin}
        breadcrumb = {{ routes }}
        extra={[
            <Button key="1" type="primary"
                onClick={() => {
                    navigate(`/product/${product.usin}/edit`);
                }}>
                Edit the product
            </Button>,
        ]}
        footer={
        <div>
            <Tabs defaultActiveKey="1">
                <TabPane tab="Description" key="1" />
            </Tabs>
        {product.description}
        </div>
        }
    >

        <Content extra={extraContent} image={product.images[0]}>
            {attributes(product.title, product.attributes)}
        </Content>
    </PageHeader>
}