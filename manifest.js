TLabs.addFeature({ //特性添加方法，不可修改

   name: '我的淘宝历史', // 特性名称，说明，可自定义
   version: '0.0.1', //特性的版本号，可自定义
   mods: [{
      matches: "item.taobao.com", // 特性适应的域，正则表达式，允许是 `*`
      path: 'public/client.js'  //特性的主逻辑js名称，可自定义
       // csspath: 'style.css'如果有css文件的话，这里定义文件名，一起打包
   }]
});