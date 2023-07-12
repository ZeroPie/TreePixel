<script lang="ts" setup>
import { PropType } from 'vue';
import { VueDraggableNext } from 'vue-draggable-next'

interface ILink {
  img: string,
  icon: string,
  title: string,
  description: string,
  nickname: string,
  url: string,
  realprefix: string,
  placeholder: string,
  infolabel: string,
  prefix: string,
  active: boolean,
}

const props = defineProps({
  socialLinks_active: {
    type: Object as PropType<Array<ILink>>,
    default: []
  }
})
const emit = defineEmits<{
  (ev: 'changeOrder', from: number, to: number): void;
  (ev: 'deleteLink', title: string): void;
}>()

const changeHandler = (param: { moved: { newIndex: number, oldIndex: number }}) => {
  emit('changeOrder', param.moved.oldIndex, param.moved.newIndex);
}

const deleteSocialLinkActiveById = (title: string) => {
  emit('deleteLink', title);
}
</script>

<template>
  <VueDraggableNext
    handle=".dragBox"
    v-model="props.socialLinks_active"
    @change="changeHandler"
  >
    <template v-for="(socialLink) in socialLinks_active" :key="socialLink.title">
      <transition-group v-if="socialLink.active" >
        <div class="selectLinkBx" v-if="socialLink.active">
          <div>
            <img class="dragBox grabbable" src="/images/line-icon.svg" alt="icon" />
          </div>
          <div class="linkfillInfoBox">
            <div class="socialLinktitleBox">
              <img :src="socialLink.img" alt="icon" height="48" />
              <div class="titleaccountBox">
                <h2 class="mb0 font16 font600">Add {{ socialLink.title }}</h2>
                <p class="mb0 colorGrey">{{ socialLink.description }}</p>
                <div class="socialfillinfobox">
                  <div class="form-group">
                    <label class="form-label colorGrey">Nickname</label>
                    <input type="text" class="form-control" name="text" v-model="socialLink.nickname">
                  </div>
                  <div class="form-group">
                    <label class="form-label colorGrey">{{ socialLink.infolabel }}</label>
                    <div class="input-group">
                      <span class="input-group-text">{{ socialLink.prefix }}</span>
                      <input type="text" class="form-control" aria-describedby="basic-addon3 basic-addon4"
                        v-model="socialLink.url" :placeholder="`${socialLink.placeholder}`" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="deleteBox pointer" @click="deleteSocialLinkActiveById(socialLink.title)">
            <img src="/images/delete-icon.svg" alt="icon" />
          </div>
        </div>
      </transition-group>
    </template>
  </VueDraggableNext>
</template>

<style scoped></style>
