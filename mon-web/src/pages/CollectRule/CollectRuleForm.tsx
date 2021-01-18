import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, TreeSelect, Select, Collapse, Popover, InputNumber } from 'antd';
import queryString from 'query-string';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import request from '@pkgs/request';
import api from '@common/api';
import { normalizeTreeData, renderTreeNodes } from '@pkgs/Layout/utils';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';
import { TreeNode } from '@pkgs/interface';
import { nameRule, interval } from './config';
import Fields from './Fields';

const FormItem = Form.Item;
const { Option } = Select;
const { Panel } = Collapse;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 10 },
  },
};

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 14,
      offset: 10,
    },
  },
};

const clearDirtyReqData = (data: any) => {
  function make(dat: any) {
    _.forEach(dat, (val, key) => {
      if (_.isArray(val)) {
        const newVal = _.compact(val);
        if (newVal.length) {
          dat[key] = _.map(newVal, (item) => {
            make(item);
            return item;
          });
        } else {
          delete dat[key];
        }
      }
    });
  }
  make(data);
};

const CreateForm = (props: any) => {
  const { getFieldDecorator, validateFields, getFieldProps } = props.form;
  const nType = _.get(props.match, 'params.type');
  const query = queryString.parse(props.location.search);
  const [fields, setFields] = useState<any>([]);
  const [value, setValue] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [regionData, setRegionData] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      const dat = await request(
        `${api.createRules}?id=${query.id}&type=${query.type}`,
      );
      setValue(dat);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      console.log(e);
    }
  };

  const fetchRegionData = () => {
    return request(`${api.regions}`);
  };

  const handlerPOST = (values: any) => {
    request(api.createRules, {
      method: 'POST',
      body: JSON.stringify([
        {
          type: query.type,
          data: {
            creator: value.creator,
            created_at: value.created_at,
            timeout: values.timeout,
            comment: values.comment,
            tags: values.tags,
            id: values.id,
            nid: Number(query.nid),
            region: values.region,
            service: values.service,
            step: values.step,
            name: values.name,
            collect_type: query.type,
            data: values,
          },
        },
      ]),
    })
      .then(() => {
        message.success('保存成功！');
        props.history.push({
          pathname: '/collect-rules',
        });
      })
      .catch((e) => {
        console.log(e);
      });
  };
  const handlerPUT = (values: any) => {
    request(api.createRules, {
      method: 'PUT',
      body: JSON.stringify({
        type: query.type,
        data: {
          id: value?.id,
          name: values?.name,
          tags: values.tags,
          region: values?.region,
          nid: Number(query.nid),
          collect_type: query.type,
          timeout: values.timeout,
          comment: values.comment,
          data: values,
        },
      }),
    })
      .then(() => {
        message.success('修改成功！');
        props.history.push({
          pathname: '/collect-rules',
        });
      })
      .catch((e) => {
        console.log(e);
      });
  };
  const handleSubmit = (e: any) => {
    e.preventDefault();
    validateFields((err: any, values: any) => {
      // TODO: 不知道哪里污染了数据，导致
      clearDirtyReqData(values);
      if (!err) {
        if (nType === 'add') {
          handlerPOST(values);
        } else {
          handlerPUT(values);
        }
      }
    });
  };
  const getTemplate = () => {
    return request(`${api.collectRules}/${query.type}/template`).then((res) => {
      setFields(res);
    });
  };
  const fetchTreeData = () => {
    return request(api.tree).then((res) => {
      return normalizeTreeData(res);
    });
  };

  useEffect(() => {
    getTemplate();
    fetchTreeData().then((res) => {
      setTreeData(res);
    });
    fetchRegionData().then((res) => {
      setRegionData(res);
    });
    if (nType === 'add') {
      setLoading(false);
    } else {
      fetchData();
    }
  }, []);
  return (
    <>
      <p style={{ fontSize: 16 }}>
        <b>
          {
            nType === 'add' ? `新增 ${query.type}` : `${value.collect_type}-${value.id}`
          }
        </b>
      </p>
      <Form onSubmit={handleSubmit}>
        <Collapse
          defaultActiveKey={['1', '2']}
          style={{ width: 1200, margin: 'auto' }}
        >
          <Panel header="综合配置" key="1">
            <FormItem
              label={<Popover content="nid">归属节点</Popover>}
              required
              {...formItemLayout}
            >
              {getFieldDecorator('nid', {
                initialValue: query.nid,
                rules: [{ required: true, message: '请选择节点！' }],
              })(
                <TreeSelect
                  showSearch
                  allowClear
                  treeDefaultExpandAll
                  treeNodeFilterProp="path"
                  treeNodeLabelProp="path"
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                >
                  {renderTreeNodes(treeData, 'treeSelect')}
                </TreeSelect>,
              )}
            </FormItem>
            <FormItem
              label={<Popover content="name">采集名称</Popover>}
              {...formItemLayout}
            >
              <Input
                {...getFieldProps('name', {
                  initialValue: nType === 'modify' ? value?.name : '',
                  rules: [{ required: true, message: '必填项！' }, nameRule],
                })}
                size="default"
                placeholder="不能为空！"
              />
            </FormItem>
            <FormItem
              label={<Popover content="region">区域名称</Popover>}
              {...formItemLayout}
            >
              <Select
                size="default"
                {...getFieldProps('region', {
                  initialValue: value?.region || regionData[0],
                  rules: [{ required: true, message: '请选择！' }],
                })}
              >
                {_.map(regionData, item => (
                  <Option key={item} value={item}>
                    {item}
                  </Option>
                ))}
              </Select>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={<Popover content="timeout">采集超时时间</Popover>}
            >
              <InputNumber
                min={0}
                size="default"
                {...getFieldProps('timeout', {
                  initialValue: nType === 'modify' ? value?.timeout : '',
                  rules: [{ required: true, message: '请输入！' }],
                })}
              />{' '}
              秒
            </FormItem>
            <FormItem
              label={<Popover content="step">采集周期</Popover>}
              {...formItemLayout}
            >
              <Select
                size="default"
                style={{ width: 100 }}
                {...getFieldProps('step', {
                  initialValue: value?.step,
                  rules: [{ required: true, message: '请选择！' }],
                })}
              >
                {_.map(interval, item => (
                  <Option key={item} value={item}>
                    {item}
                  </Option>
                ))}
              </Select>{' '}
              秒
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={<Popover content="tags">Tags</Popover>}
            >
              <Input
                type="textarea"
                placeholder=""
                {...getFieldProps('tags', {
                  initialValue: nType === 'modify' ? value?.tags : '',
                })}
              />
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={<Popover content="comment">备注</Popover>}
            >
              <Input
                type="textarea"
                placeholder=""
                {...getFieldProps('comment', {
                  initialValue: nType === 'modify' ? value?.comment : '',
                })}
              />
            </FormItem>
            {nType !== 'modify' ? null : (
              <div>
                <FormItem
                  {...formItemLayout}
                  label={<Popover content="updater">更新人</Popover>}
                >
                  <div>{value.updater}</div>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label={<Popover content="updated_at">更新时间</Popover>}
                >
                  <div>{value.updated_at}</div>
                </FormItem>
              </div>
            )}
          </Panel>
          <Panel header="专属配置" key="2">
            {fields?.fields?.map((item: any) => {
              return (
                <Fields
                  {...formItemLayout}
                  key={item.name}
                  loading={loading}
                  nType={nType}
                  field={item}
                  definitions={fields.definitions || {}}
                  initialValues={value.data || {}}
                  getFieldDecorator={getFieldDecorator}
                />
              );
            })}
          </Panel>
        </Collapse>
        <FormItem {...tailFormItemLayout} style={{ marginTop: 10 }}>
          <Button type="primary" htmlType="submit">
            保存
          </Button>
          <Button style={{ marginLeft: 8 }}>
            <Link to={{ pathname: '/collect-rules' }}>返回</Link>
          </Button>
        </FormItem>
      </Form>
    </>
  );
};

export default CreateIncludeNsTree(Form.create()(CreateForm));
