// Chart.js v4は、使うグラフ要素(軸・線・点など)を明示的に登録する必要がある。
// 今回使う予定の「折れ線グラフ」「円グラフ」の両方に必要な要素をまとめてここで登録しておく。
// クライアント限定(.client.ts)なのは、Chart.jsがブラウザの<canvas>を前提としたライブラリのため。
import {
  Chart, // グラフ本体のクラス。registerの呼び出し口
  CategoryScale, // 軸: 「4月」などの離散的なラベルを扱う(折れ線グラフのX軸)
  LinearScale, // 軸: 連続する数値を扱う(折れ線グラフのY軸)
  PointElement, // 描画要素: 折れ線グラフの点(データポイント)の見た目
  LineElement, // 描画要素: 折れ線グラフの線の見た目
  LineController, // コントローラー: 「折れ線グラフ」を成立させる司令塔
  ArcElement, // 描画要素: 円グラフ・ドーナツグラフの扇形の見た目
  DoughnutController, // コントローラー: 「ドーナツ/円グラフ」を成立させる司令塔
  Tooltip, // プラグイン: ホバー時に数値を表示する
  Legend, // プラグイン: 凡例(色と系列名の対応表)を表示する
} from 'chart.js';

export default defineNuxtPlugin(() => {
  Chart.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    LineController,
    ArcElement,
    DoughnutController,
    Tooltip,
    Legend,
  );
});
