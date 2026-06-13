export default defineAppConfig({
  pages: [
    'pages/members/index',
    'pages/plans/index',
    'pages/records/index',
    'pages/profiles/index',
    'pages/feedback/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FF6B35',
    navigationBarTitleText: '智慧体育',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#FF6B35',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/members/index',
        text: '队员'
      },
      {
        pagePath: 'pages/plans/index',
        text: '训练计划'
      },
      {
        pagePath: 'pages/records/index',
        text: '现场记录'
      },
      {
        pagePath: 'pages/profiles/index',
        text: '体测档案'
      },
      {
        pagePath: 'pages/feedback/index',
        text: '家长反馈'
      }
    ]
  }
})
