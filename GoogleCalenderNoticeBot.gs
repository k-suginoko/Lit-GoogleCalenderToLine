// TODO:やりたいこと
/*

大会などの応募の締め切りを通知したい
Googleカレンダーから情報を引っ張ってきてLineのグループに通知する　のベース作る。
5分毎に取得して、
カレンダーって他のことも書いている気がするから特定の文字列「締め切り」とかでソートかける
*/


// 必要情報
const LINE_ACCESS_TOKEN = '' // Line notifyのアクセストークン
const GOOGLE_CALENDER_ID = '' // GoogleカレンダーのID
const notificationTime = 10 // 何分前通知

// 今日のGoogleカレンダーをチェックしてイベントをまとめてシートに記入
// この関数をトリガーにします
function getGoogleCalenderCheck () {
  const now = new Date()
  // カレンダー情報取得
  const myCalender = CalendarApp.getCalendarById(GOOGLE_CALENDER_ID)
  // 今日のイベント取得
  const myEvents = myCalender.getEventsForDay(now)
  

  // 今日の予定をまとめる
  for (let i = 0; myEvents.length > i; i++) {
    const events = myEvents[i]
    const titles = events.getTitle()
    const startTime = myEvents[i].getStartTime()
    // 予定開始時間からn分(notificationTime)引いた時刻取得
    const startMinutesBefore = startTime.getTime() - (notificationTime*60*1000)
    console.log('titles', titles)

    // 予定時刻からnotificationTime分引いた時間になったら、かつ文字列に/締め切り|締切|〆切/を含めてればlineに通知する
    if (startMinutesBefore < now && now < startTime && titles.match(/締め切り|締切|〆切/)) {
      // 時間をGASに合わせてUTC時間に変換
      const startGasTime = Utilities.formatDate(startTime, 'JST', 'HH:mm')
      // 通知テキスト作成
      const msg = sendMsg(startGasTime, titles)
      // lineに通知
      postMessage(msg)
    }
  }
}

// 通知テキストを決める
function sendMsg (time, title) {
  return `${ time }に${ title }の予定が〆切になります`
}

// Line通知のAPIをたたく
function postMessage (msg) {
  const option = {
    "method": "POST",
    "payload": "message=" + msg,
    "headers": {
      "Authorization": "Bearer " + LINE_ACCESS_TOKEN
    }
  }

  UrlFetchApp.fetch("https://notify-api.line.me/api/notify", option)
}

