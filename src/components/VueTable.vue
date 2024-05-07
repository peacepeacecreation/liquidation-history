<template>
    <div class="">
        <input
            v-model="search"
            class="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Search"
            >
        <div class="vue-table right-0 z-10 mt-5 origin-top-right divide-y rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div v-for="(column, colKey) in filterData"
                :key="colKey"
                class="text-gray-700 block px-4 py-2 text-sm cursor-pointer hover:bg-gray-50"
                :class="{ 'bg-cyan-600 hover:bg-cyan-600 text-gray-100 cursor-default': modelValue && column[label] == modelValue[label]}"
                @click="$emit('update:modelValue', column)"
            >
                {{ column[label] }}
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        modelValue: {
            type: Object,
            default: null,
        },
        data: {
            type: Array,
            default: null,
        },
        label: {
            type: String,
            default: 'name',
        },
    },

    data() {
        return {
            search: '',
        }
    },

    computed: {
        filterData() {
            let data = this.data

            // if (this.modelValue) {
            //     const curRowIndex = data.findIndex((row) => row[this.label] == this.modelValue[this.label])
            //     const [curRow] = data.splice(curRowIndex, 1)

            //     console.log(curRow)
            //     data.unshift(curRow)
            // }

            if (this.search) {
                data = data.filter((row) => {
                    return String(row[this.label]).toLowerCase().includes(this.search.toLowerCase());
                });
            }

            return data
        }
    }
}
</script>

<style>
.vue-table {
    height: 100%;
    overflow-y: auto;
}
</style>
