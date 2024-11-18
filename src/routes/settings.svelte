<script lang="ts">
  import type { EntityUrls, EntityStyles, EntityId, Records, Eng2Ru, Cell } from "./types"
  type RowItem = {
    id: string,
    styles: string,
    color?: string,
    'background-color'?: string,
    fields: { id: string, name: string, value: string }[]
  }

  type Props = {
    records: Records,
    entityStyles: EntityStyles,
    cellUrls: EntityUrls,
    eng2ru: Eng2Ru,
    dataColumns: Record<string, string>,
    fieldsTypes: Record<string, string[]>,
    rowData: RowItem[],
  }
  
  let {
    records,
    entityStyles,
    cellUrls,
    eng2ru,
    dataColumns,
    fieldsTypes,
    rowData,
  }: Props = $props()

  const tabs: Record<keyof EntityStyles, string> = {
    records: 'Справочники',
    cols: 'Столбцы',
    rows: 'Строки',
  }

  let selectedTab: keyof EntityStyles = $state('rows')

  const defaultStyle: Record<string, string> = {
    'background-color': "#ffffff",
    'color': "#333333",
  }

  type SavedStyles = {
    'background-color': Record<string, string>,
    'color': Record<string, string> 
  }

  const savedStyles: SavedStyles = {
    'background-color': {},
    'color': {},
  }

  const cellCheckboxes = [
    ['Курсив', 'font-style', 'italic'],
    ['Жирный', 'font-weight', 'bold'],
    ['Прописные', 'text-transform', 'lowercase'],
    ['Заглавные', 'text-transform', 'uppercase'],
    ['Заглавная', 'text-transform', 'capitalize'],
    ['Подчеркнутые', 'text-decoration', 'underline'],
  ]

  let entity = $state<Record<string, string>>({ value: '', id: '' })

  let styleSettings = $derived.by(() => {
    const styles: Record<string, string> = {}
    if(entityStyles[entity.id]) {
      entityStyles[entity.id].split(";").forEach(style => {
        if(style) {
          const [name, value] = style.split(/\:\s?/)
          styles[name] = value
        }
      })
    }
    return styles
  })

  function changeColor(e: Event) {
    const target = e.target as HTMLInputElement
    const name = target.name as string

    const value = entityStyles[entity.id] || ""
    const styles = value.split(";").filter(style => style && !style.startsWith(`${name}:`))

    styles.push(`${name}:${target.value};`)
    
    entityStyles[entity.id] = styles.join(";")
  }

  function changeStyle(e: Event) {
    const target = e.target as HTMLInputElement
    const name = target.name as string
    const reverseValue = target.dataset.reverseValue as string
    let styles = (entityStyles[entity.id] || "").split(";").filter(Boolean)

    // если наследуется стиль столбца или строки
    // например font-weight:bold
    // то нужно позволить убирать\заменять
    // на font-weight: bold
    if(reverseValue === 'true') {
      let value = ''
      if(name === 'font-weight:bold')
        value = 'font-weight:normal'
      else if(name === 'font-style:italic')
        value = 'font-style:normal'
      else if(name === 'text-decoration:underline')
        value = 'text-decoration:none'
      else if(name === 'text-transform:uppercase'
      || name === 'text-transform:lowercase'
      || name === 'text-transform:capitalize')
        value = 'text-transform:none'

      if(styles.includes(value))  
        styles = styles.filter(style => style !== value)
      else
        styles.push(value)
    } else {
      const [styleName, _] = name.split(/\:\s*/)
      // cтиль уже есть, значит удалить
      if(styles.includes(name)) {
        styles = styles.filter(style => style !== name)
      }
      // поменять значение стиля,
      // например text-decoration:lowercase на text-decoration:uppercase
      else if(styles.find(style => style.startsWith(styleName))) {
        styles = styles.filter(style => !style.startsWith(styleName))
        styles.push(name)
      }
      // стиля нет - добавить.
      else {
        styles.push(name)
      }
      console.log(styles.join(";"))
    }
    entityStyles[entity.id] = styles.join(";")
  }

  function setUrl(e: Event) {
    const target = e.target as HTMLInputElement
    cellUrls[entity.id] = target.value
  }

  function toggleStyle(e: Event) {
    const target = e.target as HTMLInputElement
    const name = target.dataset.name as keyof typeof savedStyles
    if(name in styleSettings) {
      const saved = (entityStyles[entity.id] || "").split(";").find(style => style.startsWith(name))
      if(saved) {
        savedStyles[name][entity.id] = saved
      }
      const style = (entityStyles[entity.id] || "").split(";").filter(style => style !== saved).join(";")
      entityStyles[entity.id] = style
    } else if(savedStyles[name][entity.id]) {
      entityStyles[entity.id] += savedStyles[name][entity.id] + ";"
    } 
    else {
      const style = name + ":" + defaultStyle[name] + ";"
      if(!entityStyles[entity.id])
        entityStyles[entity.id] = style
      else
        entityStyles[entity.id] += style
    }
  }

  function selectTab(e: Event) {
    const target = e.target as  HTMLSpanElement
    selectedTab = target.dataset.name as keyof EntityStyles
  }

  function changeColumnSetting(e: Event) {
    const target = e.target as HTMLSpanElement
    const id = target.dataset.id as string || ""
    const value = target.dataset.value as string || ""
    if(id && value) {
      entity = id === entity.id 
        ? { id: "", value: ""}
        : { id, value }
    }
  }

  function showColorSettings(e: Event) {
    const target = e.target as HTMLInputElement
    const name = target.dataset.name as keyof Records
    const id = target.dataset.id as EntityId
    const record = records[name]?.find(record => record.id === id)
    if(!record)
      return
    entity = record.id === entity.id 
      ? { id: "", value: ""}
      : record
  }

  function getColumnName(styleName: string) {
    for(const name of Object.keys(records)) {
      const record = records[name].find(record => record.value === entity.value)
      if(record && typeof entityStyles[dataColumns[name]] === 'string') {
        const result = entityStyles[dataColumns[name]].split(";").find(value => value.startsWith(styleName))
        return result
      }
    }
  }

  function getColumnStyle() {
    for(const name of Object.keys(records)) {
      const record = records[name].find(record => record.value === entity.value)
      if(record && typeof entityStyles[dataColumns[name]] === 'string') {
        return entityStyles[dataColumns[name]]
      }
    }
    return ""
  }

  function changeRowMatcher(e: Event) {
    const target = e.target as HTMLSelectElement
    const option = target.selectedOptions[0]
    if(!option)
      return

    const { rowid, fieldid } = target.dataset
    const name = option.dataset.name as string
    const value = target.value
    const rowItem = rowData.find(rowItem => rowItem.id === rowid)

    if(rowItem) {
      let field = rowItem.fields.find(field => field.id === fieldid)
      if(field) {
        field.name = name
        field.value = value
      }
    }
  }

  function addRowMatch(e: Event) {
    const target = e.target as HTMLButtonElement
    const rowid = target.dataset.rowid
    const rowItem = rowData.find(rowItem => rowItem.id === rowid)
    if(rowItem && !rowItem.fields.find(field => field.name === "")) {
      console.log('add row match')
      rowItem.fields.push({ id: crypto.randomUUID(), name: "", value: "" })
    }
  }

  function changeFieldValueMatcher(e: Event) {
    const target = e.target as HTMLSelectElement
    const { rowid, fieldid } = target.dataset
    const value = target.value

    const rowItem = rowData.find(rowItem => rowItem.id === rowid)

    if(rowItem) {
      let field = rowItem.fields.find(field => field.id === fieldid)
      if(field) {
        field.value = value
      }
    }
  }

  let selectedRowItemId = $state<string>("")
  let selectedRow = $derived(rowData.find(rowItem => rowItem.id === selectedRowItemId))

  function changeRowStyle(e: Event) {
    if(!selectedRow)
      return
    const target = e.target as HTMLInputElement
    const name = target.name as string
    let styles = selectedRow.styles.split(";").filter(Boolean)

    const [styleName, _] = name.split(/\:\s*/)
    // cтиль уже есть, значит удалить
    if(styles.includes(name)) {
      styles = styles.filter(style => style !== name)
    }
    // поменять значение стиля,
    // например text-decoration:lowercase на text-decoration:uppercase
    else if(styles.find(style => style.startsWith(styleName))) {
      styles = styles.filter(style => !style.startsWith(styleName))
      styles.push(name)
    }
    else {
      styles.push(name)
    }

    const row = rowData.find(row => row === selectedRow)
    if(row)
      row.styles = styles.join(";")
  }

  function addRowRequirement(e: Event) {
    const id = crypto.randomUUID()
    rowData.push({ id, fields: [], styles: "" })
    selectedRowItemId = id
  }
</script>

<div class='box justify-items-start'>
  <!-- Табы -->
  <div class="tabs" onclick={selectTab}>
    {#each Object.keys(tabs) as name}
      <span class="tabs-item" data-name={name} class:selected={selectedTab === name}>
        {tabs[name as keyof typeof tabs]}
      </span>
    {/each}
  </div>

  <div class="content-wrapper scroll-y">
    <!-- Контент справочников -->
    {#if selectedTab === 'records'}
      {#each Object.keys(records) as name}
        <div class="record">
          <div class="cell title">{eng2ru[name]}</div>
          {#each records[name] as record}
            <div
              class="cell"
              data-id={record.id}
              data-name={name}
              style={(entityStyles[dataColumns[name]] || "") + ";" + (entityStyles[record.id] || "")}
              onclick={showColorSettings}>
              {record.value}
            </div>
          {/each}
        </div>
      {/each}
    {/if}

    <!-- Контент колонок -->
    {#if selectedTab === 'cols'}
      {#each Object.keys(dataColumns) as name}
        <div class="record">
          <div
            class="cell"
            style={entityStyles[dataColumns[name]] || ""}
            data-id={dataColumns[name]}
            data-value={eng2ru[name]}
            onclick={changeColumnSetting}>
            {eng2ru[name]}
          </div>
        </div>
      {/each}
    {/if}

    <!-- Контент строк -->
    {#if selectedTab === 'rows'}
      <div class="flex flex-col px-3">
        <button
          class="btn btn-primary mb-2"
          onclick={addRowRequirement}>
          Добавить условие
        </button>
        {#each rowData as rowItem, i}
          <div class="flex flex-col">
            <div
              data-id={rowItem.id}
              style={selectedRowItemId === rowItem.id ? 'color:blueviolet' : ''}
              onclick={() => selectedRowItemId = selectedRowItemId === rowItem.id ? '' : rowItem.id}>
              Условие {i + 1}
            </div>
            {#if selectedRowItemId === rowItem.id}
              <div class="flex flex-col">
                {#each rowItem.fields as { name, id, value }}
                  <select data-rowid={rowItem.id} data-fieldid={id} onchange={changeRowMatcher}>
                    <option value="">Выбор столбца</option>
                    {#each Object.keys(dataColumns) as columnName}
                      <option value={value} data-name={columnName} selected={columnName === name}>
                        {eng2ru[columnName]}
                      </option>
                    {/each}
                  </select>
                  {#if name in records}
                    <select data-record onchange={changeFieldValueMatcher} data-rowid={rowItem.id} data-fieldid={id}>
                      <option value="">Выбор столбца</option>
                      {#each records[name] as record}
                        <option value={record.id} data-name={record.value} selected={record.id === value}>
                          {record.value}
                        </option>
                      {/each}
                    </select>
                  {:else if fieldsTypes.number.includes(name)}
                    <div class="flex flex-row flex-nowrap gap-1 items-center">
                      <select>
                        <option value="<">&lt;</option>
                        <option value=">">&gt;</option>
                        <option value=">=">&gt;=</option>
                        <option value="<=">&lt;=</option>
                        <option value="=">=</option>
                      </select>
                      <input value="" />
                    </div>
                  {:else}
                    <div>text</div>
                  {/if}
                {/each}
                <button
                  class="btn btn-primary"
                  onclick={addRowMatch}
                  data-rowid={rowItem.id}>
                  Добавить совпадение
                </button>
              </div>
            {/if}
          </div>
        {/each}

        {#if selectedRow}
          <div class="flex flex-col my-3">
            {#each cellCheckboxes as [title, styleName, styleValue]}      
              <label>
                <input
                  type='checkbox'
                  name={styleName + ":" + styleValue}
                  checked={selectedRow.styles.includes(styleName + ":" + styleValue)}
                  onchange={changeRowStyle}
                />
                <span>{title}</span>
              </label>
            {/each}

            <label class="relative">
                <span>Цвет фона</span>
                <input type='color' class="w-full" name="background-color" bind:value={selectedRow['background-color']} />
            </label>
            <label class="relative">
                <span>Цвет текста</span>
                <input type='color' class="w-full" name="color" bind:value={selectedRow.color} />
            </label>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

{#if entity.id}
  <div class="content" style="border-right: 1px solid #ccc">
    <span class="cell overflow-hidden"
      data-hello2={getColumnName('background-color') }
      style={(getColumnStyle() || "")  + ";" + (entityStyles[entity.id] || "")}>
      {entity.value}
    </span>
    {#if selectedTab === 'records'}
      {#each cellCheckboxes as [title, styleName, styleValue]}      
        <label data-some={getColumnStyle()}>
          <input
            type='checkbox'
            data-reverse-value={getColumnStyle().includes(styleName)}
            name={styleName + ":" + styleValue}
            checked={styleSettings[styleName] === styleValue || getColumnStyle().includes(styleName)}
            onchange={changeStyle}
          />
          <span>{title}</span>
        </label>
      {/each}
    {:else if selectedTab === 'cols'}
      {#each cellCheckboxes as [title, styleName, styleValue]}      
        <label>
          <input
            type='checkbox'
            name={styleName + ":" + styleValue}
            checked={styleSettings[styleName] === styleValue}
            onchange={changeStyle}
          />
          <span>{title}</span>
        </label>
      {/each}
    {/if}
    
    <!-- {#if selectedTab === 'records'}
      <div class="my-2">
        <div style="line-height:18px;">Цвет фона {'background-color' in styleSettings}</div>
        <select>
          {#if selectedTab === 'records' && getColumnName('background-color')}
            <option value="1" selected={!('background-color' in styleSettings)}>От колонки</option>
          {:else}
            <option value="2" selected={!('background-color' in styleSettings)}>Не установлен</option>
          {/if}
          <option value="3"  selected={'background-color' in styleSettings}>Свой</option>
        </select>
      </div>
    {/if} -->

    {#if selectedTab === 'records' && getColumnName('background-color')}
      <div class="my-2">
        <div style="line-height:18px;">Цвет фона от колонки</div>
        <div class="cell select-none h-5" style={getColumnName('background-color')}></div>
      </div>
    {/if}

    <label class="relative">
      <div>
        <input
          type='checkbox'
          data-name="background-color"
          checked={'background-color' in styleSettings}
          onchange={toggleStyle}
        />
        <span>Цвет фона</span>
      </div>
      {#if 'background-color' in styleSettings}
        <input type='color' class="w-full" name="background-color" value={styleSettings['background-color']} oninput={changeColor} />
      {/if}
    </label>
    <label class="relative">
      <div>
        <input
          type='checkbox'
          data-name="color"
          checked={'color' in styleSettings}
          onchange={toggleStyle}
        />
        <span>Цвет текста</span>
      </div>
      {#if 'color' in styleSettings}
        <input type='color' class="w-full" name="color" value={styleSettings.color || ""} oninput={changeColor} />
      {/if}
    </label>
    <div>
      <div>Ссылка</div>
      <input class="input-url" value={cellUrls[entity.id] || ""} onchange={setUrl} placeholder="url"/>
    </div>
  </div>
{/if}

<style>
  select {
    margin-bottom: 5px;
  }
  select[data-record] {
    margin-left: 10px;
  }
  .tabs {
    display: flex;
    flex-flow: row nowrap;
    user-select: none;
  }

  .tabs-item {
    padding: 3px 10px;
    border: 1px solid transparent;
    cursor: pointer;
  }

  .tabs-item.selected {
    color: blueviolet;
    cursor: default;
  }

  label {
    user-select: none;
  }
  .input-url {
    width: 100%;
    border: 1px solid #ccc;
    padding: 3px 6px;
  }
  .content-wrapper {
    overflow-y: auto;
  }
  .content {
    width: 200px;
    background-color: white;
    height: 100%;
    padding: 20px;
    display: flex;
    flex-flow: column nowrap;
  }

  .box {
    display: flex;
    flex-flow: column nowrap;
    gap: 1px;
    background: #f5f5f5;
    box-shadow: 1px 0 4px 1px #0000001a;
    border: 1px solid #ccc;
    overflow: hidden;
  }
  .box > * {
    scroll-snap-align: start;  
  }

  .record {
    display: flex;
    flex-flow: column nowrap;
    background-color: #ccc;
    gap: 1px;
    border-left: 1px solid #ccc;
    border-right: 1px solid #ccc;
    scroll-snap-align: start;  
  }

  .cell {
    position: relative;
    padding: 3px 6px;
    border: 1px solid transparent;
    background-color: white;
    white-space: nowrap;
  }
  .cell:last-child {
    border-bottom-color: #ccc;
  }

  .content .cell {
    margin-bottom: 10px;
    border-bottom: 1px solid #ccc;
  }

  .title {
    font-weight: bold;
    background: #ccc;
  }

  input[data-reverse-value="true"] + span:after {
    display: inline-block;
    content: '!';
    color: #2c2d2b;
    background: #5ad41385;
    line-height: 12px;
    text-align: center;
    border-radius: 3px;
    padding: 2px 5px;
    border: 1px solid #67a245;
    margin-left: 3px;
  }
</style>

<!--

  <label>
      <input
        type='checkbox'
        name="font-style:italic"
        checked={styleSettings['font-style'] === 'italic'}
        onchange={changeStyle}
      />
      <span>Курсив</span>
    </label>
    <label>
      <input
        type='checkbox'
        name="font-weight:bold"
        checked={styleSettings['font-weight'] === 'bold'}
        onchange={changeStyle}
      />
      <span>Жирный</span>
    </label>
    <label>
      <input
        type='checkbox'
        name="text-transform:uppercase"
        checked={styleSettings['text-transform'] === 'uppercase'}
        onchange={changeStyle}
      />
      <span>Заглавные</span>
    </label>
    <label>
      <input
        type='checkbox'
        name="text-transform:lowercase"
        checked={styleSettings['text-transform'] === 'lowercase'}
        onchange={changeStyle}
      />
      <span>Прописные</span>
    </label>
    <label>
      <input
        type='checkbox'
        name="text-decoration:underline"
        checked={styleSettings['text-decoration'] === 'underline'}
        onchange={changeStyle}
      />
      <span>Подчеркнутые</span>
    </label>
-->