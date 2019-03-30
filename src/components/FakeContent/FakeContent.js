import React from 'react'

import mock from '../../assets/mocks/linesList'

const FakeContent = () => (
  <dl style={{ position: 'fixed', bottom: 0, visibility: 'hidden' }}>
    {Object.values(mock).map(({ line, descr }, i) => (
      <div key={i}>
        <dt key={`${i}_dt`}>{line}</dt>
        <dd key={`${i}_dd`}>{descr}</dd>
      </div>
    ))}
  </dl>
)

export default FakeContent
