import { CheckOutlined, DeleteOutlined } from '@ant-design/icons'
import { Button, Col, Menu, Row, Table } from 'antd'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'

import { getRequestDeleted, getRequestUser } from '~/api/Request/request'
import { getListReviewer } from '~/api/Reviewer/reviewer'
import globalSocket from '~/common/GlobalSocket'
import Information from '~/components/Information'
import { fontStyles } from '~/constants/fontStyles'
import useCallApiList from '~/hook/useCallApiList'
import useCommon from '~/hook/useCommon'
import useConvertData from '~/hook/useConvertData'
import useDarkMode from '~/hook/useDarkMode'
import { scrollToTop } from '~/utils/animationscrollToTop'
import useStyles from './styles'

const SeeRequest = () => {
	const socket = globalSocket(import.meta.env.VITE_SERVER)
	const { innerWidth, userInfo, handleGetUserDetail } = useCommon()
	const { dataUser } = useConvertData({
		userInfo
	})
	const { darkModeLocalStorage } = useDarkMode()
	const { styles } = useStyles({
		innerWidth,
		darkModeLocalStorage
	})
	const [current, setCurrent] = useState('pending')
	const [items] = useState([
		{
			key: 'pending',
			label: 'Đang chờ duyệt'
		},
		{
			key: 'approved',
			label: 'Đã duyệt'
		},
		{
			key: 'refused',
			label: 'Đã từ chối'
		}
	])
	const [dataRequest, setDataRequest] = useState([])

	const columns = [
		{
			title: 'STT',
			dataIndex: 'key',
			key: 'key',
			sorter: (a, b) => a.key - b.key
		},
		{
			title: 'Ảnh',
			dataIndex: 'image',
			key: 'image',
			render: url => <img className="image" src={`data:image/png;base64,${url}`} alt="" />
		},
		{
			title: 'Họ tên',
			dataIndex: 'name',
			key: 'name'
		},
		{
			title: 'Tiêu Đề',
			dataIndex: 'title',
			key: 'title',
			render: data => {
				if (data.seeDetail === false) {
					return <h4 to={`/assignment-details`}>{data.title}</h4>
				}
				return <Link to={`/assignment-details`}>{data.title}</Link>
			},
			sorter: (a, b) => a.title.localeCompare(b.title)
		},
		{
			title: 'Mô tả',
			dataIndex: 'description',
			key: 'description',
			render: description => <p className="description">{description}</p>
		},
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			key: 'status'
		},
		{
			title: 'Hiển thị',
			dataIndex: 'visibility',
			key: 'visibility'
		},
		{
			title: 'Ngày nhận',
			dataIndex: 'date',
			key: 'date'
		},
		{
			title: 'Chấp thuận',
			dataIndex: 'acceptance',
			key: 'acceptance',
			render: data => {
				if (data) {
					return (
						<Button
							onClick={() => handleOnClickAcceptance(data)}
							type={`${darkModeLocalStorage === false ? '' : 'primary'}`}
						>
							<CheckOutlined />
						</Button>
					)
				}
				return (
					<Button
						style={{
							opacity: '.2'
						}}
						type={`${darkModeLocalStorage === false ? '' : 'primary'}`}
					>
						<CheckOutlined />
					</Button>
				)
			}
		},
		{
			title: 'Từ chối',
			dataIndex: 'refuse',
			key: 'refuse',
			render: data => {
				if (data) {
					return (
						<Button
							onClick={() => handleOnClickRefuse(data)}
							type={`${darkModeLocalStorage === false ? '' : 'primary'}`}
						>
							<DeleteOutlined />
						</Button>
					)
				}
				return (
					<Button
						style={{
							opacity: '.2'
						}}
						type={`${darkModeLocalStorage === false ? '' : 'primary'}`}
					>
						<DeleteOutlined />
					</Button>
				)
			}
		}
	]

	const handleOnClickAcceptance = async data => {
		const dataReal = {
			title: 'Acceptance',
			name: `${dataUser.lastName} ${dataUser.firstName}`,
			sender: dataUser._id,
			receiver: data.receiver,
			idRequest: data.idRequest,
			status: 'approved'
		}
		await socket.emit('createResponse', dataReal)
		await handleGetUserDetail(dataUser._id)
	}

	const handleOnClickRefuse = async data => {
		const dataReal = {
			title: 'Your request has been denied',
			name: `${dataUser.lastName} ${dataUser.firstName}`,
			sender: dataUser._id,
			receiver: data.receiver,
			idRequest: data.idRequest,
			status: 'rejected'
		}
		await socket.emit('createResponse', dataReal)
		await handleGetUserDetail(dataUser._id)
	}

	useEffect(() => {
		scrollToTop()
	})

	useEffect(() => {
		;(async () => {
			if (dataUser?._id) {
				try {
					const res = await getRequestUser({
						receiver: dataUser._id,
						status: 'pending'
					})
					const data = []
					res.forEach((element, index) => {
						data.push({
							key: index + 1,
							image: element.sender.imagePath,
							name: element.name,
							title: {
								title: element.title,
								seeDetail: false
							},
							description: element.description,
							status: element.status,
							visibility: element.visibility,
							date: element.createdAt,
							acceptance: {
								idRequest: element._id,
								receiver: element.sender._id
							},
							refuse: {
								idRequest: element._id,
								receiver: element.sender._id
							}
						})
					})
					setDataRequest(data)
				} catch (error) {
					console.log('error: ', error)
					toast.error(error.message)
				}
			}
		})()
	}, [dataUser])

	const { list } = useCallApiList(getListReviewer, 'reviewer')

	const onClick = async e => {
		setCurrent(e.key)
		switch (e.key) {
			case 'pending': {
				const res = await getRequestUser({
					receiver: dataUser._id,
					status: 'pending'
				})
				const data = []
				res.forEach((element, index) => {
					data.push({
						key: index + 1,
						image: element.sender.imagePath,
						name: element.name,
						title: {
							title: element.title,
							seeDetail: false
						},
						description: element.description,
						status: element.status,
						visibility: element.visibility,
						date: element.createdAt,
						acceptance: {
							idRequest: element._id,
							receiver: element.sender._id
						},
						refuse: {
							idRequest: element._id,
							receiver: element.sender._id
						}
					})
				})
				setDataRequest(data)
				break
			}
		}
		switch (e.key) {
			case 'approved': {
				const res = await getRequestUser({
					receiver: dataUser._id,
					status: 'approved'
				})
				const data = []
				res.forEach((element, index) => {
					data.push({
						key: index + 1,
						image: element.sender.imagePath,
						name: element.name,
						title: {
							title: element.title,
							seeDetail: true
						},
						description: element.description,
						status: element.status,
						visibility: element.visibility,
						date: element.createdAt,
						acceptance: null,
						refuse: null
					})
				})
				setDataRequest(data)
				break
			}
		}
		switch (e.key) {
			case 'refused': {
				const res = await getRequestDeleted(dataUser._id)
				console.log('data: ', res)
				const data = []
				res.forEach((element, index) => {
					data.push({
						key: index + 1,
						image: element.sender.imagePath,
						name: element.name,
						title: {
							title: element.title,
							seeDetail: false
						},
						description: element.description,
						status: element.status,
						visibility: element.visibility,
						date: element.createdAt,
						acceptance: null,
						refuse: null
					})
				})

				setDataRequest(data)
				break
			}
		}
	}

	const onChange = async (pagination, filters, sorter, extra) => {
		console.log('pagination: ', pagination)
		console.log('filters: ', filters)
		console.log('sorter: ', sorter)
		console.log('extra: ', extra)
	}

	return (
		<div className={`${styles.SeeRequest}`}>
			<Row className="row">
				<Col lg={24} xl={17} className="col">
					<div className="container-list-request">
						<Menu
							className="menu"
							mode="horizontal"
							onClick={onClick}
							defaultSelectedKeys={[current]}
							theme={`${darkModeLocalStorage === false ? 'light' : 'dark'}`}
							items={items}
						/>
						<div className="content">
							{dataRequest && dataRequest.length > 0 ? (
								<Table
									className="table"
									size="middle"
									columns={columns}
									pagination={{
										pageSize: 6,
										position: ['bottomCenter']
									}}
									dataSource={dataRequest}
									onChange={onChange}
								/>
							) : (
								<Table
									className="table"
									size="middle"
									columns={columns}
									pagination={{
										pageSize: 6,
										position: ['bottomCenter']
									}}
									dataSource={[]}
									onChange={onChange}
								/>
							)}
						</div>
					</div>
				</Col>
				<Col lg={24} xl={6} className="col">
					<div className="container-list-review">
						<h5 className={`title ${fontStyles['headline-5-regular-24px']}`}>Đánh giá gần nhất</h5>
						<ul className="list">
							{list &&
								list.length > 0 &&
								list.map((element, index) => (
									<li key={index}>
										<Information
											isReviewerPage
											url={element.url}
											name={element.name}
											description={element.description}
										/>
									</li>
								))}
						</ul>
					</div>
				</Col>
			</Row>
		</div>
	)
}

export default SeeRequest