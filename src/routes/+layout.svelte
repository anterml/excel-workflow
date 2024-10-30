<script lang="ts">
  import '../app.css'
  import type { Snippet } from 'svelte'
  type Props = {
    children: Snippet,
  }
  let { children }: Props = $props()

</script>

<div class="root-wrap">
  <div class="controls">
    <a href="/" class="settings">
      Главная
    </a>
    <a href="settings" class="settings">
      Настройки
    </a>
  </div>
  {@render children()}
</div>


<style>
  .root-wrap {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    height: 100%;
    max-height: 100%;
    overflow: hidden;
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

  .settings {
    border: 1px solid #ddd;
    border-radius: 3px;
    padding: 5px 10px;
  }
</style>