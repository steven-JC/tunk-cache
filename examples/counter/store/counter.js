import {create, action} from 'tunk';

/*

  action随时更新cache，

  动作为单位
      数据进行缓存 - 直接拿缓存作为动作结果 -- 应用唤醒 第一个动作才有意义


*/
@create({snapshot:'ls'})
export default class counter {
  //不允许异步，应该保持简单
  constructor(){
    this.state = {
      count:0
    };
  }

  @action
  increment(){
    console.log(this);
    return {count:this.addOne()};
  }

  @action
  decrement(){
    return {count:this.state.count-1};
  }

  @action
  incrementIfOdd(){
    if ((this.state.count + 1) % 2 === 0) {
      this.increment();
    }
  }

  @action
  incrementAsync(){
    setTimeout(() => {
      this.dispatch('increment');
    }, 1000)
  }

  addOne(){
    return this.state.count+1;
  }
}

