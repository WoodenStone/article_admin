<template>
  <div class="muli-tags" @click="focus">
    <el-button
      class="btn"
      v-for="(tag, index) in tags"
      :key="index"
      @click="delTag(index)"
    >
      {{ tag }} <span>x</span>
    </el-button>
    <input
      type="text"
      ref="input"
      label="tagInput"
      @keydown.enter="split"
      @keydown.delete="del"
      v-model="current"
    />
  </div>
</template>

<script>
export default {
  name: 'TagInput',
  props: {
    value: Array,
    default: () => []
  },
  methods: {
    focus () {
      this.$refs.input.focus()
    },
    split (e) {
      e.preventDefault()
      this.add(e)
    },
    add (e) {
      const val = e.target.value
      if (!val || this.tags.indexOf(val) > -1) {
        return
      }
      if (val.length > 20) {
        this.$message('太长的标签')
        return
      }
      this.tags.push(val)
      this.$emit('input', this.tags)
      this.current = ''
    },
    del (e) {
      if (!e.target.value.length) {
        this.tags.pop()
        this.$emit('input', this.tags)
      }
    },
    delTag (index) {
      this.tags.splice(index, 1)
      this.$emit('input', this.tags)
    }
  },
  computed: {
    tags () {
      return this.value.slice()
    }
  },
  data () {
    return {
      current: ''
    }
  }
}
</script>

<style lang="less">
.muli-tags {
  padding: 5px 10px;
  display: block;
  width: auto;
  input {
    outline: 0;
    background: transparent;
    border: 1px solid #dcdfe6;
    border-radius: 5px;
    width: 60px;
    &:focus {
      border: 1px solid #509efd;
      width: 120px;
      transition: 0.3s;
    }
  }
  .btn {
    font-size: 0.8rem;
    margin: 0 3px;
    padding: 3px;
    border-radius: 5px;
    cursor: pointer;
    color: #000;
    background: rgba(80, 158, 253, 0.3);
  }
}
</style>
