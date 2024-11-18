<script lang="ts">
  import Settings from './settings.svelte'
  import DataDB from './data/DBdata'
  import DataRecords from './data/DBrecords'
  import dataColumns from './data/DBcolumns'

  import type { EntityStyles, Records, Cell, DataType, EntityUrls, EntityId } from "./types"
  import { Fields, eng2ru, generateData } from './constants'
  import moveExcelTableByX from './actions/moveExcelTableByX'
  import DBrecords from './data/DBrecords'

  const canEditRecord = true
  let showSettings = $state<boolean>(true)

  const entityStyles = $state<EntityStyles>({
    'source': 'color:pink;',
  })

  const cellUrls: EntityUrls = {}
  
  const records = $state<Records>(DataRecords)
  const data = $state<DataType>(DataDB)

  type RowItem = {
    id: string,
    styles: string,
    color?: string,
    'background-color'?: string,
    fields: { id: string, name: string, value: string }[]
  }
  let rowData = $state<RowItem[]>([{
    id: crypto.randomUUID(),
    styles: "",
    'background-color': "#c93131",
    fields: [
      { id: crypto.randomUUID(), name: "source", value: "a5999c2f-1c67-40a5-a5f7-d48ba411dec6" },
      { id: crypto.randomUUID(), name: "productName", value: "49105bde-3120-4551-b4b3-e5181c1bf221" },
    ]
  }])

  type HeaderName = keyof typeof eng2ru

  let isNewTooltip: boolean = false
  let recordData = $state<{ value: string, id: string }[]>([])

  let recordPopup = $state<boolean>(false)
  let newRecord = $state<string>("")

  let textInput = $state<HTMLInputElement | null>(null)
  let recordInput = $state<HTMLInputElement | null>(null)
  let celleditable = $state<boolean>(false)
  let selectedColumn = $state<HeaderName>("createdAt")
  let selectedRow = $state<number>(-1)
  type PreviousValue = { row: number, column: HeaderName, value: string | number }
  let savePreviousValue: PreviousValue[] = []

  function setSelectedCell(e: Event) {
    //e.preventDefault()
    e.stopPropagation()
    const target = e.target as HTMLDivElement
    const name = target.dataset.name as HeaderName
    const i = Number(target.dataset.i) as number
    const isSameCell = selectedColumn === name && selectedRow === i

    if(!(i >= 0 && name in eng2ru))
      return

    if(!isSameCell) {
      selectedColumn = name
      selectedRow = i
      celleditable = false
    }
  }

  function onkeypress(e: KeyboardEvent) {
    if(e.key === 'Enter') {
      textInput = null
      recordInput = null
      celleditable = false
    }
  }

  $effect(() => {
    if(celleditable) {
      recordData = records[selectedColumn as keyof typeof records]
      
      const input = Fields.record.includes(selectedColumn)
        ? recordInput
        : textInput
      input?.focus()
    }
  })


  let myindex = 0
  // --- EntityPortal
  let entityPortal: HTMLElement;
  let entityPortalVisible = $state<boolean>(false)
  let currentEntityName: string | undefined;

  function showContextMenu(e: MouseEvent) {
    e.preventDefault()
    const target = e.target as HTMLDivElement
    entityPortalVisible = true
    entityPortal.style.top = (e.offsetY + 3) + 'px'
    entityPortal.style.left = (e.offsetX + 3) + 'px'
    entityPortal.style.display = ''
    currentEntityName = target.dataset.name as HeaderName
    selectedColumn = currentEntityName as HeaderName
    selectedRow = parseInt(target.dataset.i as string)
    target.append(entityPortal)
    setTimeout(() => {
      const elem = entityPortal.querySelectorAll("[role='menuitem']")[0]
      elem && (elem as HTMLElement).focus()
    }, 1)
  }

  function preventContextMenu(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
  }

  function portalEntityOnkeypress(e: KeyboardEvent) {
    const target = e.target as HTMLElement
    
    if(e.key === 'Enter') {
      hideEntityPortal()
      return addEntity(target.dataset.event || "")
    }

    if(e.key !== 'ArrowDown' && e.key !== 'ArrowUp')
      return console.log('arrow', e.key, e.key !== 'ArrowDown', e.key !== 'ArrowUp')

    const menuitems = entityPortal.querySelectorAll('[role="menuitem"]')
    const count = menuitems.length
    myindex += e.key === 'ArrowDown' ? 1 : -1

    let i = (myindex % count)
    if(i < 0)
      i += count

    const elem = menuitems[i] as HTMLElement
    elem?.focus()
  }

  function hideEntityPortal() {
    entityPortalVisible = false
  }

  function getColor(value: string) {
    switch(value) {
      case 'Зеленый': return 'green'
      case 'Синий': return 'blue'
      case 'Оранжевый': return 'orange'
      default: return ''
    }
  }

  function changeCellColor(e: Event) {
    const target = e.target as HTMLElement
    if(target.nodeName.toLowerCase() === 'a')
      return
    e.preventDefault()
    e.stopPropagation()

    const event = target.dataset.event || ""
    const id = target.dataset.id || ""

    const cm = contextMenuValues.find(cm => String(cm.id) === id)
    if(!cm)
      return

    if(cm.name === 'Статус') {
      data[selectedRow].value[selectedColumn].color = getColor(event)
    } else if(cm.name === 'Добавить заметку') {
      isNewTooltip = true
      data[selectedRow].value[selectedColumn].descr = ""
    }
    hideEntityPortal()
  }

  async function addEntity(eventName: string) {
    // todo
  }

  function clearStateByEsc(e: KeyboardEvent) {
    if(e.key.toLowerCase() == 'z' && e.ctrlKey) {
      if(savePreviousValue.length) {
        const item = savePreviousValue.pop() as PreviousValue
        const { row, column, value } = item
        data[row].value[column].value = value
      }
    }
    if(e.key === 'Escape') {
      clearState(true)
    }
  }

  function clearState(clearSelectedRow?: boolean) {
    textInput = null
    recordInput = null
    celleditable = false
    if(clearSelectedRow)
      selectedRow = -1
    hideEntityPortal()
  }

  function changeRecord(e: Event) {
    const target = e.target as HTMLInputElement
    const columnName = target.dataset.columnName as keyof typeof records
    console.log(columnName, records[columnName])
    recordData = records[columnName].filter(record => record.value.toLowerCase().includes(target.value.toLowerCase()))
  }

  function setRecord(e: Event) {
    const target = e.target as HTMLDivElement
    data[selectedRow].value[selectedColumn].value = target.dataset.id as string
    celleditable = false
  }

  function addNewRecord() {
    const rec = records[selectedColumn as keyof typeof records]
    if(!rec.find(record => record.value === newRecord))
      rec.push({ value: newRecord, id: crypto.randomUUID() })
    recordPopup = false
    newRecord = ""
  }

  const contextMenu: Record<HeaderName, number[]> = {
    productName: [1,2,3],
    price: [3],
    count: [3],
    createdAt: [3],
    deliveredAt: [3],
    customer: [3],
    servicePrice: [3],
    sum: [3],
    source: [3],
    paymentMethod: [3],
    address: [3],
    phone: [3],
    leisure: [3],
    comment: [3],
    producer: [3],
    creator: [3],
    invoice1: [3],
    invoice2: [3],
  }

  type ContextMenuValues = { id: number, type: 'group', name: string, values: string[] }
    | { id: number,  name: string }

  const contextMenuValues: ContextMenuValues[] = [
    { id: 1, type: 'group', name: 'Статус', values: ['Обычный', 'Зеленый', 'Синий', 'Оранжевый'] },
    { id: 2, type: 'group', name: 'Выбор', values: ['Пометить', 'Скрыть'] },
    { id: 3, name: 'Добавить заметку',  },
  ]

  let currentTooltip = $state<HTMLDivElement>()

  $effect(() => {
    if(currentTooltip && isNewTooltip) {
      isNewTooltip = false
      currentTooltip?.focus()
    }
  })

  /* типы для Object.keys(item) */
  function getItemKeys(item: Record<HeaderName, Cell>) {
    return Object.keys(item) as HeaderName[]
  }

  function dblclick(e: Event) {
    savePreviousValue.push({
      column: selectedColumn,
      row: selectedRow,
      value: data[selectedRow].value[selectedColumn].value
    })
    celleditable = true
  }

  $effect(() => {
    const sidePanel = document.querySelector('.side-panel') as HTMLDivElement
    const parent = sidePanel?.parentElement as HTMLDivElement
    if(sidePanel && parent) {
      sidePanel.style.display = 'none'
      parent.style.gridTemplateColumns = "1fr"
    }
  })

  function mergeStyles(columnId: EntityId, row: DataType[number], cell: Cell) {
    let styles = ""
    // стили для колонки
    if(entityStyles[columnId])
      styles += entityStyles[columnId]
    // стили для строки
    if(entityStyles[row.id])
      styles += entityStyles[row.id]
    // стили для справочника
    if(cell.type === 'record' && entityStyles[cell.value])
      styles += entityStyles[cell.value]
    // стили для ячейки
    if(entityStyles[cell.id])
      styles += entityStyles[cell.id]

    const superRowStyles = getStyleSuperRow(row.value)
    if(superRowStyles) {
      if(styles)
        styles += ";"
      styles += superRowStyles
    }

    /* const superRowId: EntitySuperRowId = `super_${rowId}`
    if(entityStyles[superRowId])
      styles += entityStyles[superRowId] */
    
    return styles
  }

  $inspect(rowData)

  let contextMenuItemUrl = $derived.by(() => {
    if(selectedRow >= 0 && selectedColumn) {
      const cell = data[selectedRow].value[selectedColumn]
      return cellUrls[cell[cell.type === 'record' ? 'value' : 'id']]
    }
  })

  function getStyleRow(row: typeof data[number]['value']) {
    // todo
    return ''
  }

  function getStyleSuperRow(row: typeof data[number]['value']) {
    for(const rowItem of rowData) {
      const match = rowItem.fields.length && rowItem.fields.every(field => {
        const dbrecord = DBrecords[field.name] as Records[keyof Records]
        if(!dbrecord)
          return
        const record = DBrecords[field.name].find(record => record.id === row[field.name].value)
        if(!record)
          return console.log('fieldName not found', field.name)
        if(record.id === field.value) {
          return true
        }
      })

      if(match) {
        const styles = rowItem.styles ? [rowItem.styles] : []
        if(rowItem.color)
          styles.push('color:' + rowItem.color)
        if(rowItem['background-color'])
          styles.push('background-color:' + rowItem['background-color'])

        return styles.join(";")
      }
    }

    return ''
  }
</script>

<svelte:window onkeydown={clearStateByEsc} onclick={() => clearState(true)} />

<div class="wrap">
  <div class="flex flex-row flex-nowrap overflow-hidden">
    {#if showSettings}
      <Settings {records} {entityStyles} {cellUrls} {eng2ru} {dataColumns} fieldsTypes={Fields} {rowData} />
    {/if}
  </div>
  <div class="excel-wrap" use:moveExcelTableByX>
    <div class="table-box grid grid-cols-tableline_auto-19 content-start h-fit w-max">
      <!-- Заголовки столбцов -->
      <div class="content-wrapper">
        <div class="content grid grid-cols-subgrid col-start-1 -col-end-1">          
          {#each Object.keys(dataColumns) as name} 
            <div class={`cell-wrap title ${name}`}>
              <span class="cell">
                {eng2ru[name as HeaderName]}
              </span>
            </div>
          {/each}
        </div>
      </div>

      <div class="content-wrapper scroll-y">
      <!-- Контент строк -->
      {#each data as row, i}
        <div class={`content grid grid-cols-subgrid col-start-1 -col-end-1 saturn-bg-status-1`} style={getStyleRow(row.value)}>
          {#each getItemKeys(row.value) as columnName}
            {@const cell = row.value[columnName]}
            {@const cellValue = cell.type === 'record' ? records[columnName].find(r => r.id === cell.value)?.value : cell.value}
            {#if Fields.disabled.includes(columnName)}
              <div
                class='cell-wrap cell-value'
                class:selected={selectedRow === i && selectedColumn === columnName}
                onclick={setSelectedCell}
                oncontextmenu={showContextMenu}
                data-bgcolor={cell.color}
                data-name={columnName}
                data-i={i}
              >
                <span class="cell" style={mergeStyles(dataColumns[columnName], row, cell)}>{cellValue}</span>
              </div>
            {:else}
              <div
                class={`cell-wrap cell-value ${columnName} ${!Fields.record.includes(columnName) ? 'text-input' : ''}`}
                class:selected={selectedRow === i && selectedColumn === columnName}
                class:multicelledit={Fields.record.includes(columnName) && celleditable}
                onclick={setSelectedCell}
                ondblclick={dblclick}
                oncontextmenu={showContextMenu}
                data-bgcolor={cell.color}
                data-name={columnName}
                data-i={i}
              >
                <span
                  style={mergeStyles(dataColumns[columnName], row, cell)}
                  class="cell span"
                  class:editable={celleditable && selectedRow === i && selectedColumn === columnName}
                >
                  {cellValue}
                </span>
                {#if celleditable && selectedRow === i && selectedColumn === columnName}
                  <!-- Справочник -->
                  {#if Fields.record.includes(columnName)}
                    <div class="record-wrap" class:editable={canEditRecord}>
                      <input class="record-input" bind:this={recordInput} data-column-name={columnName} value={cellValue} placeholder="record" oninput={changeRecord} spellcheck="false"/>
                      <div class="record-btn-add" data-name={columnName} onclick={() => recordPopup = true}>+</div>
                      <div class="record-select" onclick={setRecord}>
                        {#each recordData as record}
                          <div class="record-option" data-id={record.id} class:active={record.id === cell.id}>{record.value}</div>
                        {/each}
                      </div>
                    </div>
                  <!-- Дата -->
                  {:else if Fields.date.includes(columnName)}
                    <input bind:value={cell.value} bind:this={textInput} onkeypress={onkeypress} type="date" spellcheck="false" />
                  <!-- Числа -->
                  {:else if Fields.number.includes(columnName)}
                    <input bind:value={cell.value} bind:this={textInput} onkeypress={onkeypress} type="number" spellcheck="false" />
                  <!-- Текст -->
                  {:else}
                    <input bind:value={cell.value} bind:this={textInput} onkeypress={onkeypress} spellcheck="false" />
                  {/if}
                {/if}
                {#if selectedRow === i && selectedColumn === columnName && typeof cell.descr === 'string'}
                  <div class="tooltip" bind:this={currentTooltip} bind:innerHTML={cell.descr} contenteditable>{cell.descr}</div>
                {/if}
                {#if cell.descr}
                  <div class="tooltip-mark"></div>
                {/if}
              </div>
            {/if}
          {/each}
          <!-- <div class="cell cell-value status">
            <select bind:value={item.status.value}>
              <option value="1">В пути</option>dp
              <option value="2">На складе</option>
              <option value="3">На выставке</option>
              <option value="4">С дефектом</option>
            </select>
          </div> -->
        </div>
      {/each}
      </div>
    </div>
  </div>
</div>

<ul
  onclick={changeCellColor}
  onkeydown={portalEntityOnkeypress}
  oncontextmenu={preventContextMenu}
  role="menu"
  tabindex="0"
  class={`${entityPortalVisible ? 'block' : 'hidden'} z-10 bg-white absolute top-2 right-2 w-52 rounded-sm p-0.5 not-italic no-underline font-normal`}
  bind:this={entityPortal}>

  {#each contextMenu[selectedColumn] as id}
    {@const item = contextMenuValues.find(v => v.id === id) as ContextMenuValues}
    {#if 'type' in item}
      <li class="listitemstatus rounded-sm px-2 py-1 text-gray-400">{item.name}</li>
      {#each item.values as value}
        <li class="rounded-sm px-2 py-1 hover:bg-slate-400" role="menuitem" tabindex="0" data-id={id} data-event={value}>
          {value}
        </li>
      {/each}
    {:else}
      <li class="rounded-sm px-2 py-1 hover:bg-slate-400" role="menuitem" tabindex="0" data-id={id} data-event={item.name}>
        {item.name}
      </li>
    {/if}
  {/each}

  {#if contextMenuItemUrl}
    <li class="rounded-sm px-2 py-1 hover:bg-slate-400" role="menuitem" tabindex="0">
      <a href={contextMenuItemUrl} target="_blank">
        Открыть страницу
      </a>
    </li>
  {/if}
</ul>

{#if recordPopup}
  <div class="fixed inset-0 bg-gray-500 z-10" onclick={() => { recordPopup = false; newRecord = "" }}></div>
  <div class="record-popup z-20">
    <div class="bg-slate-400 px-3 py-2">Новая запись</div>
    <div class='flex items-center px-3 py-2 gap-2'>
      <input bind:value={newRecord} class="px-1 py-0.5 border border-gray-500" spellcheck="false"/>
      <button onclick={addNewRecord} class="btn btn-primary">Добавить</button>
    </div>
  </div>
{/if}

<style>
  .content-wrapper {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: subgrid;
    gap: 1px;
  }

  .wrap {
    display: grid;
    grid-template-columns: auto 1fr;
    max-height: 100%;
    overflow: hidden;
    height: 100%;
  }

  .controls {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 15px 20px;
    gap: 5px 10px;
    background-color: #333;
    color: white;
  }

  .controls > span {
    border: 1px solid #ddd;
    border-radius: 3px;
    padding: 5px 10px;
  }

  .active {
    color: blueviolet;
  }

  .table-box {
    background: #ccc;
    padding: 1px;
    gap: 1px;
    grid-template-rows: auto 1fr;
    overflow: hidden;
    height: 100%;
  }

  .excel-wrap {
    overflow-x: auto;
    height: 100%;
    /* overscroll-behavior: var(--overscroll-behavior);
	  scroll-snap-type: var(--scroll-snap-type); */
  }

  .tooltip {
    position: absolute;
    min-width: 300px;
    max-width: 400px;
    min-height: 50px;
    left: calc(100% + 1px);
    top: 0;
    z-index: 2;
    padding: 3px 6px;
    background-color: #fff;
    outline: 1px solid #444;
    background-color: #daf0ff;
    font-size: 14px;
    font-style: italic;
    white-space: initial;
  }

  .tooltip-mark {
    position: absolute;
    width: 5px;
    height: 5px;
    top: 0px;
    right: -1px;
    background-color: #ccc;
    z-index: 1;
  }

  .selected .tooltip-mark {
    display: none;
  }

  .record-popup {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
  }

  /* .record-select {
    background-color: white;
    box-shadow: 0 0 2px 2px #a4a3a3;
    position: absolute;
    top: 106%;
    left: 0;
    z-index: 1;
    min-width: 100%;

  } */

  .record-input {
    padding: 3px 6px;
    border: 1px solid transparent;
  }

  .record-select {
    grid-column: 1 / -1;
    background-color: #fff;
    border-top: 1px solid blueviolet;
  }

  .record-option {
    padding: 3px 6px;
    border: 1px solid transparent;
  }

  .record-option:not(:last-child) {
    /* border-bottom: 2px solid transparent; */
    margin-bottom: 1px;
  }

  .record-option:hover {
    background-color: #efefef;
    cursor: pointer;
    border-color: #efefef;
    outline: 1px solid #efefef;
  }

  .record-option.selected {
    color: blueviolet;
  }

  .record-wrap {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    align-items: center;
    position: absolute;
    outline: 1px solid blueviolet;
    background-color: #fff;
    top: 0;
    left: 0;
    gap: 0 3px;
    z-index: 100;
  }

  .record-wrap.editable {
    grid-template-columns: 1fr auto;
  }
  
  .record-btn-add {
    display: none;
    width: 30px;
    height: 100%;
    background-color: #8a2be2;
    cursor: pointer;
    font-weight: bold;
    color: white;
  }

  .editable .record-btn-add {
    display: grid;
    justify-content: center;
    align-items: stretch;
    align-content: center;
  }

  .cell-wrap {
    position: relative;
    white-space: nowrap;
  }

  .cell {
    display: block;
    padding: 3px 6px;
    border: 1px solid transparent;
  }

  .selected .cell {
    border-color: #ccc;
  }

  .cell-wrap.multicelledit {
    border: none;
  }

  .multicelledit .tooltip {
    display: none;
  }

  .cell-wrap[data-bgcolor="blue"] {
    background-color: #88b4fd;
  }

  .cell-wrap[data-bgcolor="green"] {
    background-color: #96cc96;
  }
  
  .cell-wrap[data-bgcolor="orange"] {
    background-color: #ffc164;
  }

  .cell-wrap input {
    padding: 3px 6px;
    field-sizing: content;
  }

  .record-wrap .record-input:focus-within {
    outline: none;
  }

  .text-input input:focus-within {
    outline: 1px solid blueviolet;
  }

  .text-input input {
    position: absolute;
    inset: 0 auto 0 0;
    min-width: 100%;
  }

  .multicelledit input {
    color: blueviolet;
    padding: 3px 6px;
  }

  .selected > * {
    outline: 1px solid blueviolet;
    z-index: 100;
  }

  .selected span.editable {
    outline: none
  }

  .title {
    background-color: #efefef;
    font-weight: bold;
  }

  .content {
    scroll-snap-align: var(--scroll-snap-align)
  }
  
  .content:has(> .selected) {
    outline: 1px dashed #333;
  }

  .disabled {
    color: #555;
  }

  .saturn-bg-status-1 .cell-wrap {
    background-color: white;
  }
  .saturn-bg-status-2 .cell-wrap {
    background-color: #88b4fd;
  }
  .saturn-bg-status-3 .cell-wrap {
    background-color: #96cc96;
  }
  .saturn-bg-status-4 .cell-wrap {
    background-color: #ffc164;
  }

  [role="menuitem"] {
    font-size: 15px;
    line-height: 18px;
  }

  .listitemstatus {
    font-size: 12px;
  }
  .listitemstatus:not(:first-child) {
    margin-top: 0px;
  }

  [role="menu"] {
    box-shadow: 0px 0px 4px 1px #595959
  }

  .cell-wrap .span {
    pointer-events: none;
  }
</style>