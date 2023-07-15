let TABS_LIMIT = 5
/* 
    タブを開いた場合などで「タブを開く」「ページを開く」「ページの読み込みが終わる」
    は別イベント扱いになり、処理が重複するので、雑にフラグ処理で対応。
*/
let flg = true

// Listener中のasyncは処理を待たないで動作するため、addListenerには処理は入れない。 
chrome.tabs.onUpdated.addListener(
    async () => {
        if(flg == true){
            flg = false;
            await main();
            flg = true
        }
    }
)

// 処理部
async function main(){
    let tabs = await chrome.tabs.query({url: "*://*/*"});
    if (tabs.length > TABS_LIMIT){
        await tabEraser();
    }
    return;
}

async function tabEraser(){
    /* 
    配列の後ろ（一番右のタブ）を無慈悲に削除するメソッド
    Tabオブジェクトには生成タイミングの情報がないので、正確に制御するためには生成日時を取ってChrome内のDBに貯める必要がある。
    処理が煩雑になるのでやらない。
    */
    let tabs = await chrome.tabs.query({url: "*://*/*"})
    console.log(tabs)
    while(tabs.length > TABS_LIMIT){
        try{
            await chrome.tabs.remove(tabs.slice(-1)[0].id)
            tabs = await chrome.tabs.query({url: "*://*/*"})
        } catch(error){
            // 同時処理の場合などに回避不可能なエラーが出ることが想定できるが、無視する。
            console.log(error)
            tabs = await chrome.tabs.query({url: "*://*/*"})
        }
    }
}
