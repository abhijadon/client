import { Tag, Row, Col, Select, message, Button, Input, Progress } from 'antd';
import useLanguage from '@/locale/useLanguage';
import { useMoney } from '@/settings';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import { request } from '@/request';
import useFetch from '@/hooks/useFetch';
import RecentTable from './components/RecentTable';
import CircularProgress from '@mui/joy/CircularProgress';
import { GrPowerReset } from "react-icons/gr";
import SvgIcon from '@mui/joy/SvgIcon';
import PreviewCard from './components/PreviewCard';
import CustomerPreviewCard from './components/CustomerPreviewCard';
import { useState, useEffect } from 'react';
import DataYear from './components/DataYear'
export default function DashboardModule() {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();

  const [institutes, setInstitutes] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [paymentType, setpaymentType] = useState([]);
  const [selectedInstitute, setSelectedInstitute] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedCounselor, setSelectedCounselor] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [filteredPaymentData, setFilteredPaymentData] = useState({});
  const [universityExistenceMessage, setUniversityExistenceMessage] = useState('');



  const handleInstituteChange = (value) => {
    setSelectedInstitute(value);
  };

  const handleUniversityChange = async (value) => {
    setSelectedUniversity(value);
    setUniversityExistenceMessage(''); // Reset the university existence message

    // Check if the selected university exists in the dataset
    if (value && universities.indexOf(value) === -1) {
      setUniversityExistenceMessage(`The specified university (${value}) does not exist in the dataset.`);
      setFilteredPaymentData({ total_course_fee: 0 }); // Set payment to 0
    } else {
      setFilteredPaymentData({}); // Clear filtered data
    }
  };

  const handleCounselorChange = (value) => {
    setSelectedCounselor(value);
  };
  const handlePaymentChange = (value) => {
    setSelectedPayment(value);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const resetData = () => {
    setSelectedInstitute('');
    setSelectedUniversity('');
    setSelectedCounselor('');
    setSelectedPayment('');
    setSelectedDate('');
    setFilteredPaymentData({});
    setUniversityExistenceMessage('');
  };
  const fetchData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}api/payment/filter`);
      const data = await response.json();

      if (data.success && data.result !== null) {
        const uniqueInstitutes = Array.isArray(data.result) ? [...new Set(data.result.map((item) => item.institute_name))] : [];
        const uniqueUniversities = Array.isArray(data.result) ? [...new Set(data.result.map((item) => item.university_name))] : [];
        const uniqueCounselors = Array.isArray(data.result) ? [...new Set(data.result.map((item) => item.counselor_email))] : [];
        const uniquePayment = Array.isArray(data.result) ? [...new Set(data.result.map((item) => item.payment_type))] : [];

        setInstitutes(uniqueInstitutes);
        setUniversities(uniqueUniversities);
        setCounselors(uniqueCounselors);
        setpaymentType(uniquePayment);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedInstitute || selectedUniversity || selectedCounselor || selectedDate || selectedPayment) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_SERVER}api/payment/summary?institute_name=${selectedInstitute}&university_name=${selectedUniversity}&counselor_email=${selectedCounselor}&date=${selectedDate}&payment_type=${selectedPayment}`
          );
          const data = await response.json();
          if (data.success && data.result !== null) {
            setFilteredPaymentData(data.result || {});

            let successMessage = 'Data fetched successfully.';
            if (selectedUniversity) {
              successMessage = `Data fetched successfully for the specified university: ${selectedUniversity}.`;
            } else if (selectedInstitute) {
              successMessage = `Data fetched successfully for the specified institute: ${selectedInstitute}.`;
            } else if (selectedCounselor) {
              successMessage = `Data fetched successfully for the specified counselor: ${getEmailName(selectedCounselor)}.`;
            } else if (selectedDate) {
              successMessage = `Data fetched successfully for the specified date: ${selectedDate}.`;
            }
            else if (selectedPayment) {
              successMessage = `Data fetched successfully for the specified date: ${selectedPayment}.`;
            }
            message.success(successMessage);
          } else {
            setFilteredPaymentData({
              total_course_fee: 0,
              total_paid_amount: 0,
              due_amount: 0,
            });
            let errorMessage = 'No data found based on the specified filters.';
            if (selectedUniversity) {
              errorMessage = `No data found for the specified filters and university: ${selectedUniversity}.`;
            } else if (selectedInstitute) {
              errorMessage = `No data found for the specified filters and institute: ${selectedInstitute}.`;
            } else if (selectedCounselor) {
              errorMessage = `No data found for the specified filters and counselor: ${getEmailName(selectedCounselor)}.`;
            } else if (selectedDate) {
              errorMessage = `No data found for the specified filters and date: ${selectedDate}.`;
            }
            else if (selectedPayment) {
              errorMessage = `No data found for the specified filters and date: ${selectedPayment}.`;
            }
            message.error(errorMessage);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };

    const getEmailName = (email) => {
      console.log('Email:', email); // Log the email value
      if (!email) return '';
      const parts = email.split('@');
      return parts[0];
    };
    fetchData();
  }, [selectedInstitute, selectedUniversity, selectedCounselor, selectedDate, selectedPayment]);

  const { result: invoiceResult, isLoading: invoiceLoading } = useFetch(() =>
    request.summary({ entity: 'invoice' })
  );

  const { result: quoteResult, isLoading: quoteLoading } = useFetch(() =>
    request.summary({ entity: 'quote' })
  );

  const { result: paymentResult, isLoading: paymentLoading } = useFetch(() =>
    request.summary({ entity: 'payment' })
  );

  const { result: clientResult, isLoading: clientLoading } = useFetch(() =>
    request.summary({ entity: 'client' })
  );

  const dataTableColumns = [
    {
      title: translate('number'),
      dataIndex: 'number',
    },
    {
      title: translate('Client'),
      dataIndex: ['client', 'company'],
    },

    {
      title: translate('Total'),
      dataIndex: 'total_course_fee',
      onCell: () => {
        return {
          style: {
            textAlign: 'right',
            whiteSpace: 'nowrap',
          },
        };
      },
      render: (total_course_fee) => moneyFormatter({ amount: total_course_fee }),
    },
    {
      title: translate('Status'),
      dataIndex: 'status',
      render: (status) => {
        let color = status === 'Draft' ? 'volcano' : 'green';

        return <Tag color={color}>{translate(status)}</Tag>;
      },
    },
  ];

  const entityData = [
    {
      result: invoiceResult,
      isLoading: invoiceLoading,
      entity: 'invoice',
      title: translate('Institute preview'),
    },
    {
      result: quoteResult,
      isLoading: quoteLoading,
      entity: 'quote',
      title: translate('University preview'),
    },
    {
      result: paymentResult,
      isLoading: paymentLoading,
      entity: 'payment',
      title: translate('Status preview'),
    },
  ];


  const statisticCards = entityData.map((data, index) => {
    const { result, entity, isLoading, title } = data;

    if (entity === 'qoute') return null;

    return (
      <PreviewCard
        key={index}
        title={title}
        isLoading={isLoading}
        entity={entity}
        statistics={
          !isLoading &&
          result?.performance?.map((item) => ({
            tag: item?.status,
            color: 'blue',
            value: item?.percentage,
          }))
        }
      />
    );
  });

  const getEmailName = (email) => {
    if (!email) return '';
    const parts = email.split('@');
    return parts[0];
  };

  {/* progrsh bar */ }
  const calculatePercentage = (currentAmount, targetAmount) => {
    return (currentAmount / targetAmount) * 100;
  };
  const percentage1 = filteredPaymentData ? calculatePercentage(filteredPaymentData.total_course_fee || paymentResult?.total_course_fee, 3000000) : 0;
  const percentage2 = filteredPaymentData ? calculatePercentage(filteredPaymentData.total_paid_amount || paymentResult?.total_paid_amount, 2000000) : 0;
  const percentage3 = filteredPaymentData ? calculatePercentage(filteredPaymentData.due_amount || paymentResult?.due_amount, 1000000) : 0;
  {/* progrsh bar */ }

  return (
    <>
      {universityExistenceMessage && (
        <Row gutter={[32, 32]}>
          <Col span={24}>
            <div style={{ color: 'red' }}>{universityExistenceMessage}</div>
          </Col>
        </Row>
      )}
      <div className='flex justify-items-start items-center mb-[30px] gap-3'>
        <Select className='w-72 h-10'
          value={selectedInstitute}
          onChange={handleInstituteChange}
          placeholder="Select Institute Name"
        >
          <Select.Option value=''>Select Institute Name</Select.Option>
          {institutes.map((option) => (
            <Select.Option key={option} value={option}>
              {option}
            </Select.Option>
          ))}
        </Select>

        <Select className='w-72 h-10'
          value={selectedUniversity}
          onChange={handleUniversityChange}
        >
          <Select.Option value=''>Select University Name</Select.Option>
          {universities.map((option) => (
            <Select.Option key={option} value={option}>
              {option}
            </Select.Option>
          ))}
        </Select>

        <Select className='w-72 h-10'
          value={selectedCounselor}
          onChange={handleCounselorChange}
        >
          <Select.Option value=''>Select Counselor</Select.Option>
          {counselors.map((email) => (
            <Select.Option key={email} value={email}>
              {getEmailName(email)}
            </Select.Option>
          ))}
        </Select>
        <Select className='w-72 h-10'
          value={selectedPayment}
          onChange={handlePaymentChange}
        >
          <Select.Option value=''>Select Payment Type</Select.Option>
          {paymentType.map((payment) => (
            <Select.Option key={payment} value={payment}>
              {payment}
            </Select.Option>
          ))}
        </Select>
        <Input className='text-sm font-thin h-10'
          type='date'
          onChange={handleDateChange}
          value={selectedDate}
          style={{ width: '140px', marginRight: '16px', textTransform: 'uppercase', }}
        />

        <Button onClick={resetData} className='bg-transparent text-gray-500 flex items-center gap-2 hover:text-blue-500'>
          <GrPowerReset />Reset
        </Button>
      </div>


      <div className='mb-10 flex gap-4'>
        <Card className="w-1/3 shadow-lg">
          <div className='flex justify-between'>
            <div>
              <CardContent orientation="horizontal">
                <CardContent>
                  <Typography className="text-gray-500">Total Course Fee</Typography>
                  <Typography level="h3" className="text-green-500">
                    ₹ {filteredPaymentData.total_course_fee !== undefined ? filteredPaymentData.total_course_fee : 0 || paymentResult?.total_course_fee}
                  </Typography>
                </CardContent>
              </CardContent>
            </div>
            <div>
              <CircularProgress size="lg" determinate value={percentage1}>
                <SvgIcon>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="green"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                    />
                  </svg>
                </SvgIcon>
              </CircularProgress>
            </div>
          </div>
          <Progress percent={Math.floor(percentage1)} status="active" strokeColor={{
            from: 'green',
            to: 'black',
          }} className='mt-3' />
        </Card>
        <Card className="w-1/3 shadow-lg">
          <div className='flex justify-between'>
            <div>
              <CardContent orientation="horizontal">
                <CardContent>
                  <Typography className="text-gray-500">Total Paid Amount</Typography>
                  <Typography level="h3" className="text-blue-500">
                    ₹ {filteredPaymentData.total_paid_amount !== undefined ? filteredPaymentData.total_paid_amount : 0 || paymentResult?.total_paid_amount}
                  </Typography>

                </CardContent>
              </CardContent>
            </div>
            <div>
              <CircularProgress size="lg" determinate value={percentage2}>
                <SvgIcon>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke='red'
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                    />
                  </svg>
                </SvgIcon>
              </CircularProgress>
            </div>
          </div>
          <Progress percent={Math.floor(percentage2)} status="active" strokeColor={{
            from: 'red',
            to: 'green',
          }} className='mt-3' />
        </Card>
        <Card className="w-1/3 shadow-lg">
          <div className='flex justify-between'>
            <div>
              <CardContent orientation="horizontal">
                <CardContent>
                  <Typography className="text-gray-500">Due Amount</Typography>
                  <Typography level="h3" className="text-red-500">
                    ₹ {filteredPaymentData.due_amount !== undefined ? filteredPaymentData.due_amount : 0 || paymentResult?.due_amount}
                  </Typography>
                </CardContent>
              </CardContent>
            </div>
            <div>
              <CircularProgress size="lg" determinate value={percentage3}>
                <SvgIcon>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="blue"
                  >
                    <path
                      strokeLinecap="blue"
                      strokeLinejoin="round"
                      d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                    />
                  </svg>
                </SvgIcon>
              </CircularProgress>
            </div>
          </div>
          <Progress percent={Math.floor(percentage3)} status="active" strokeColor={{
            from: 'blue',
            to: 'red',
          }} className='mt-3' />
        </Card>
      </div>

      <div className="space30"></div>
      <Row gutter={[32, 32]}>
        <Col className="gutter-row w-full" sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 18 }}>
          <div className="whiteBox shadow" style={{ height: 458 }}>
            <Row className="pad20" gutter={[0, 0]}>
              {statisticCards}
            </Row>
          </div>
        </Col>
        <Col className="gutter-row w-full" sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 6 }}>
          <CustomerPreviewCard
            isLoading={clientLoading}
            activeCustomer={clientResult?.active}
            newCustomer={clientResult?.new}
          />
        </Col>
      </Row><div className="space30"></div>
      <Row gutter={[32, 32]}>
        <Col className="gutter-row w-full" sm={{ span: 24 }} lg={{ span: 12 }}>
          <div>
            <h3 className='text-center mb-4 font-thin text-lg border-b-2'>
              {translate('Recent Data')}
            </h3>
            <RecentTable entity={'invoice'} dataTableColumns={dataTableColumns} />
          </div>
        </Col>

        <Col className="gutter-row w-full" sm={{ span: 24 }} lg={{ span: 12 }}>
          <div className="whiteBox shadow pad20" style={{ height: '100%' }}>
            <h3 style={{ color: '#22075e', marginBottom: 5, padding: '0 20px 20px' }}>
              {translate('Recent Quotes')}
            </h3>
            <DataYear entity={'payment'} dataTableColumns={dataTableColumns} />
          </div>
        </Col>
      </Row>
    </>
  );
}
