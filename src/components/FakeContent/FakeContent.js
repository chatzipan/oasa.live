import React from 'react'

import mock from '../../assets/mocks/linesList'

const FakeContent = () => (
  <dl>
    {Object.values(mock).map(({ line, descr }, i) => (
      <div key={i}>
        <dt key={`${i}_dt`}>{line}</dt>
        <dd key={`${i}_dd`}>{descr}</dd>
      </div>
    ))}
  </dl>
)

export default FakeContent
