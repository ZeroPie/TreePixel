<script lang="ts" setup>

const supabase = useSupabaseClient()
const avatarHelper = useAvatarHelper()

const props = defineProps({
  path: {
    type: String,
    required: true,
  }
});
const emit = defineEmits<{
  (ev: 'update:path', _path: string): void;
  (ev: 'update:avatarFilePath', _path: string): void;
}>();

const uploading = ref<boolean>(false)
const allowedFormats: string[] = ['jpg', 'jpeg', 'png'];

const uploadAvatar = async (evt: Event): Promise<void> => {
  const files = (evt.target as HTMLInputElement).files;
  try {
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    const fileExt:any = file.name.split('.').pop()?.toLocaleLowerCase();
    if (!allowedFormats.includes(fileExt)) {
      alert('Only JPG, JPEG and PNG files are accepted.');
      return;
    }
    const fileName = `${Math.random()}.${fileExt}`;
    const avatarFilePath = `${fileName}`;
    uploading.value = true;
    let { error: uploadError } = await supabase.storage.from('avatars').upload(avatarFilePath, file);
    if (uploadError) throw uploadError;
    emit("update:avatarFilePath", avatarFilePath);
    const avatarPath = await avatarHelper.downloadAvatar(avatarFilePath);
    emit("update:path", avatarPath);

  } catch (error: any) {
    alert(error.message);
  } finally {
    uploading.value = false;
  }
};
</script>

<template>
  <div class="userLogo pointer" @click="($refs.fileInput as HTMLInputElement).click()">
    <v-avatar :size="64" v-if="props.path !== ''" :image="props.path"></v-avatar>
    <v-avatar :size="64" v-else>
      <img src="/images/user-icon.svg" alt="user" />
    </v-avatar>
    <div class="addplusBx" size="20">
      <i v-if="uploading" class="mdi mdi-timer-sand"></i>
      <img v-else src="/images/plus-icon.svg" alt="plus" />
    </div>
  </div>
  <input ref="fileInput" style="display: none" type="file" accept="image/*" @change="uploadAvatar"
    :disabled="uploading" />
</template>
