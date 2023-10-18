import React, { useEffect, useState } from 'react';
import { Modal } from 'antd';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import axios from 'axios';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function InfoModal({ open, onClose }) {
    const [version, setVersion] = useState(null);
    const [licenses, setLicenses] = useState({});

    useEffect(() => {
        const lastFetchTimestamp = sessionStorage.getItem('lastFetchTimestamp');
        const cachedVersion = sessionStorage.getItem('version');
        const cachedLicenses = sessionStorage.getItem('licenses');

        if (lastFetchTimestamp && (Date.now() - lastFetchTimestamp < 3600000) && cachedVersion && cachedLicenses) {
            // 캐시된 데이터 사용
            setVersion(JSON.parse(cachedVersion));
            setLicenses(JSON.parse(cachedLicenses));
        } else {
            // 버전 정보 가져오기
            axios.get('https://apis.uiharu.dev/fixcors/api.php?url=https://mt.uiharu.dev/info/latest.txt')
                .then(response => {
                    const match = response.data.match(/\[([a-f0-9]+)\]\((https:\/\/github\.com\/[^)]+)\)/);
                    if (match) {
                        const shortVersion = match[1].slice(0, 6);
                        const versionUrl = match[2];
                        const versionData = { shortVersion, versionUrl };
                        setVersion(versionData);
                        sessionStorage.setItem('version', JSON.stringify(versionData));
                    }
                });

            // 라이선스 정보 가져오기
            axios.get('https://apis.uiharu.dev/fixcors/api.php?url=https://mt.uiharu.dev/info/license.json')
            .then(response => {
                const licensesData = response.data.reduce((acc, licenseInfo) => {  // JSON.parse 호출 제거
                    const { License, LibraryName, LibraryLink, LicenseLink } = licenseInfo;
                    if (!acc[License]) {
                        acc[License] = [];
                    }
                    acc[License].push({ name: LibraryName, link: LibraryLink, licenseLink: LicenseLink });
                    return acc;
                }, {});
                setLicenses(licensesData);
                sessionStorage.setItem('licenses', JSON.stringify(licensesData));
            });

            // 마지막 가져오기 시간 업데이트
            sessionStorage.setItem('lastFetchTimestamp', Date.now());
        }
    }, []);

    return (
        <Modal
            title="Information"
            open={open}
            onCancel={onClose}
            footer={null}
            width={600}
        >
            <div>
                <Typography variant="h6">버전</Typography>
                {version && (
                    <a href={version.versionUrl} target="_blank" rel="noopener noreferrer">
                        {version.shortVersion}
                    </a>
                )}
            </div>
            <div>
                <Typography variant="h6">라이선스</Typography>
                {Object.keys(licenses).map(licenseType => (
                    <Accordion key={licenseType}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>{licenseType}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <ul>
                                {licenses[licenseType].map((licenseInfo, index) => (
                                    <li key={index}>
                                        <a href={licenseInfo.link} target="_blank" rel="noopener noreferrer">
                                            {licenseInfo.name}
                                        </a>
                                        {' - '}
                                        <a href={licenseInfo.licenseLink} target="_blank" rel="noopener noreferrer">
                                            License
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </div>
        </Modal>
    );
}

export default InfoModal;
