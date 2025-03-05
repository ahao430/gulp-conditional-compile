Page({
  data: {
    // 页面数据
  },
  onLoad() {
    // 页面加载时执行
    /* if platform == wx */
    gy.showToast({
      content: '微信平台提示'
    });
    /* elif platform == alipay */
    gy.showToast({
      content: '支付宝平台提示'
    });
    /* else */
    gy.showToast({
      content: '其他平台提示'
    });
    /* endif */
  }
});
