import React, { useState } from 'react';
import { DownloadOutlined } from '@ant-design/icons';
import { Button, Divider, Flex, Radio } from 'antd';

const ExportComponent = () => {
    return (
        <>
            <Flex gap="small" align="flex-start" vertical>
                <Flex gap="small" wrap>
                    <Button shape="round" icon={<DownloadOutlined />} size="middle">
                        Экспорт в csv
                    </Button>
                </Flex>
            </Flex>
        </>
    );
};
export default ExportComponent