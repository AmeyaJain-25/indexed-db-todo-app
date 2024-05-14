import { List } from 'react-virtualized';

const data = new Array(1000000).fill('HI');

function App() {
  return (
    <div className="App">
      <List
        height={400}
        rowCount={data.length}
        rowHeight={60}
        rowRenderer={({ index, key, style }) => (
          <div key={key} style={style}>
            {data[index]}
          </div>
        )}
        width={300}
      />
    </div>
  );
}

export default App;
