import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle } from '@fortawesome/free-solid-svg-icons'

// Reversi

class Game extends React.Component {
  constructor (props) {
    super(props);

    let _field = [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 2, 0, 0, 0],
      [0, 0, 0, 2, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ];
    let _puttableField = Array.from(new Array(8), () => new Array(8).fill(false));
    for (const pos of getPuttablePositionsOnBoard(true, _field)) {
      _puttableField[pos.y][pos.x] = true;
    }

    this.state = {
      field: _field,                  // ボード全体の盤面. 8x8の二次元配列で定義
      puttableField: _puttableField,  // ボード全体の配置可能な盤面情報. 8x8の二次元配列で定義
      turn: 0,                        // 経過ターンカウンタ（0から始まる）
      whiteIsNext: true,              // 白プレイヤーの番かどうかを示すフラグ
      winnerText: null,               // 勝利テキスト
      resultText: null,               // ゲーム結果テキスト
    };
  }

  /**
   *  盤面(x, y)に石を配置する
   */
  handlePut (x, y) {
    // 配置不可能な盤面をクリックしていたら即座にreturn
    if (!this.state.puttableField[y][x]) return;

    let
      _field = this.state.field,
      _puttableField = Array.from(new Array(8), () => new Array(8).fill(false)),
      _whiteIsNext = !this.state.whiteIsNext,
      _turn = this.state.turn + 1,
      _myStone = this.state.whiteIsNext ? 1 : 2;
    
    console.log("Put:", `(${x}, ${y})`);

    // ひっくり返される盤面の座標をループ. 対応する盤面をを自分の石の値に置き換える
    for (const pos of getFlippablePositions(this.state.whiteIsNext, _field, x, y))
      _field[pos.y][pos.x] = _myStone;

    // 相手ターンの配置可能な盤面座標を配列で取得
    let puttablePos = getPuttablePositionsOnBoard(_whiteIsNext, _field);

    // 配置可能な盤面座標がなければ相手ターンを飛ばして同じ処理を行う
    if (puttablePos.length === 0) {
      _whiteIsNext = !_whiteIsNext;
      puttablePos = getPuttablePositionsOnBoard(_whiteIsNext, _field);
    }
    // 相手ターンを飛ばしてもなお配置可能盤面がなければ、全ての盤面が埋まっているのでゲーム終了
    if (puttablePos.length === 0) {
      let whiteSum = 0, blackSum = 0, winnerText, resultText;
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          if (_field[y][x] === 1) whiteSum++;
          else blackSum++;
        }
      }
      if (whiteSum > blackSum)
        winnerText = "白の勝利！";
      else if (whiteSum < blackSum)
        winnerText = "黒の勝利！";
      else
        winnerText = "引き分け";
      resultText = `白：${whiteSum}  黒：${blackSum}`;
      this.setState({
        winnerText: winnerText,
        resultText: resultText,
      });
      console.log("Game End.");
    }

    // 配置可能盤面にフラグを立てる
    for (const pos of puttablePos)
      _puttableField[pos.y][pos.x] = true;

    this.setState({
      field: _field,
      puttableField: _puttableField,
      turn: _turn,
      whiteIsNext: _whiteIsNext,
    });

  }

  render () {
    return (
      <div className="game">
        <InfoView
          turn={this.state.turn}
          whiteIsNext={this.state.whiteIsNext}
          winnerText={this.state.winnerText}
          resultText={this.state.resultText}
        />
        <Board
          field={this.state.field}
          puttableField={this.state.puttableField}
          onClick={(x, y) => this.handlePut(x, y)}
        />
      </div>
    );
  }
}


/***************************************************************
*	ボードコンポーネント
***************************************************************/
class Board extends React.Component {
  renderBlock (x, y) {
    return (
      <Block
        value={this.props.field[y][x]}
        puttable={this.props.puttableField[y][x]}
        onClick={() => this.props.onClick(x, y)}
        key={(y * 8) + x}
      />
    );
  }

  render () {
    const rowBlocks = (y) => {
      const blocks = [];
      for (let x = 0; x < 8; x++) blocks.push(this.renderBlock(x, y));
      return blocks;
    }

    return (
      <div className="board">
        <div className="board-row">{rowBlocks(0)}</div>
        <div className="board-row">{rowBlocks(1)}</div>
        <div className="board-row">{rowBlocks(2)}</div>
        <div className="board-row">{rowBlocks(3)}</div>
        <div className="board-row">{rowBlocks(4)}</div>
        <div className="board-row">{rowBlocks(5)}</div>
        <div className="board-row">{rowBlocks(6)}</div>
        <div className="board-row">{rowBlocks(7)}</div>
      </div>
    );
  }
}


/***************************************************************
*	ブロック関数コンポーネント
***************************************************************/
function Block (props) {
  let clsStoneColor = "";
  if (props.value === 1) clsStoneColor = " board__block--white";
  else if (props.value === 2) clsStoneColor = " board__block--black";
  let clsPuttable = props.puttable ? " board__block--puttable" : "";

  return (
    <div
      className={"board__block" + clsStoneColor + clsPuttable}
      onClick={() => props.onClick()}>
      {props.value === 0 ? null : <FontAwesomeIcon icon={faCircle} />}
    </div>
  );
}


/***************************************************************
*	情報ビューコンポーネント
***************************************************************/
class InfoView extends React.Component {

  render () {
    let textRow1, textRow2;
    if (!this.props.winnerText) {
      textRow1 = this.props.whiteIsNext ? "白の番です" : "黒の番です";
      textRow2 = (this.props.turn + 1) + "ターン";
    }
    else {
      textRow1 = this.props.winnerText;
      textRow2 = this.props.resultText;
    }
    
    return (
      <div className="info-view">
        <div>{textRow1}</div>
        <div>{textRow2}</div>
      </div>
    );
  }
}


ReactDOM.render(<Game />, document.getElementById('root'));


/**
 * (x, y)盤面から(vx, vy)方向に伸びる線上にある盤面の座標{x, y}を一次元配列で返却する
 */
function makePositionsLine (x, y, vx, vy) {
  let positions = [];
  while (0 <= x && x < 8 && 0 <= y && y < 8) {
    positions.push({ x: x, y: y });
    x += vx;
    y += vy;
  }
  return positions;
}

/**
 * {x, y}座標情報が格納された一次元配列から反転可能な石の座標情報を抽出して返却する
 */
function extractFlippableLine (whiteIsNext, field, line) {
  const a = whiteIsNext ? 1 : 2, b = whiteIsNext ? 2 : 1;
  let flippableLine = [];

  if (line.length >= 3 && field[line[1].y][line[1].x] === b) {
    let stone;
    for (let i = 1; i < line.length; i++) {
      stone = field[line[i].y][line[i].x];
      if (stone !== b) break;
      flippableLine.push({ x: line[i].x, y: line[i].y });
    }
    if (stone === a) return flippableLine;
    else return [];
  }
  return flippableLine;
}


/**
 * (x, y)座標に配置した場合の反転可能な石座標を全て取得
 */
function getFlippablePositions (whiteIsNext, field, x, y) {
  const vectors = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  let flippablePos = [{ x: x, y: y }];

  for (const vector of vectors) {
    // (x, y)座標から指定方向に伸びる盤面上の座標を配列で取得
    const line = makePositionsLine(x, y, ...vector);
    // 上の配列から反転可能な石座標のみで構成された配列を生成する
    const flippableLine = extractFlippableLine(whiteIsNext, field, line);

    for (const pos of flippableLine) {
      flippablePos.push({ x: pos.x, y: pos.y });
    }
  }

  return flippablePos;
}

/**
 * ボード上で配置可能な座標{x, y}を配列で取得する
 */
function getPuttablePositionsOnBoard (whiteIsNext, field) {
  const vectors = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  let puttablePos = []
  
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (field[y][x] !== 0) continue;
      // console.log(`(${x}, ${y})`);

      for (const vector of vectors) {
        // (x, y)座標から指定方向に伸びる盤面上の座標を配列で取得
        const line = makePositionsLine(x, y, ...vector);
        // 上の配列から反転可能な石座標のみで構成された配列を生成する
        const flippableLine = extractFlippableLine(whiteIsNext, field, line);

        // 8方向中いずれかが反転可能な時点でbreakする
        if (flippableLine.length > 0) {
          puttablePos.push({ x: x, y: y });
          break;
        }
      }

    }
  }

  return puttablePos;
}