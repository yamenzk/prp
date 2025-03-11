<template>
  <div class="flex flex-col gap-4">
    <EditableFieldset 
      legend="Pricing"
      :fields="listingFields"
      :data="listing"
      :columns="3"
      customClass="mb-2"
      @edit="handleEdit"
    />
    
    <!-- Offers Child Table -->
    <ChildTable
      title="Offers"
      :rows="listing.offers || []"
      :fields="offerFields"
      add-button-label="Add Offer"
      empty-message="No offers available."
      @add="addOffer"
      @update="updateOffer"
      @delete="deleteOffer"
    >
      <template #row-content="{ row }">
        <div class="flex flex-col">
          <div class="font-medium">{{ row.offer_title }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">{{ row.offer_details }}</div>
          <div class="font-bold mt-1">{{ formatCurrency(row.offer_value) }}</div>
        </div>
      </template>
    </ChildTable>
    
    <!-- Installments Child Table -->
    <ChildTable
      title="Installments"
      :rows="listing.installments || []"
      :fields="installmentFields"
      add-button-label="Add Installment"
      empty-message="No installments available."
      @add="addInstallment"
      @update="updateInstallment"
      @delete="deleteInstallment"
    >
      <template #row-content="{ row }">
        <div class="flex items-center justify-between w-full">
          <div class="font-medium">Installment: {{ row.installment_percent }}%</div>
          <div class="font-bold">{{ formatCurrency(row.installment_rate) }}</div>
        </div>
      </template>
    </ChildTable>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import EditableFieldset from '@/components/common/EditableFieldset.vue'
import ChildTable from '@/components/common/ChildTable.vue'
import { useFields } from '@/composables/useFields'

// Get formatters from useFields
const { formatCurrency } = useFields()

// Props
const props = defineProps({
  listing: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['edit-field', 'update:listing']);

// Field definitions with validations
const listingFields = [
  { 
    name: 'unit_price', 
    label: 'Unit Price', 
    type: 'currency',
  },
  { 
    name: 'downpayment', 
    label: 'Down Payment', 
    type: 'currency',
    icon: 'pi pi-money-bill',
  },
  { 
    name: 'payment_plan', 
    label: 'Payment Plan', 
    type: 'select',
    options: [
        { label: '20%/80%', value: '20/80' },
        { label: '30%/70%', value: '30/70' },
        { label: '40%/60%', value: '40/60' },
        { label: '50%/50%', value: '50/50' },
        { label: '60%/40%', value: '60/40' },
        { label: '70%/30%', value: '70/30' },
        { label: '80%/20%', value: '80/20' },
        { label: '100%', value: '100' },
    ],
    icon: 'pi pi-money-bill',
  },
]

// Offer fields based on schema
const offerFields = [
  {
    name: 'offer_title',
    label: 'Offer Title',
    type: 'text',
    icon: 'pi pi-tag',
    validation: { required: true }
  },
  {
    name: 'offer_details',
    label: 'Offer Details',
    type: 'textarea',
    icon: 'pi pi-align-left'
  },
  {
    name: 'offer_value',
    label: 'Offer Value',
    type: 'currency',
    validation: { required: true }
  }
]

// Installment fields based on schema
const installmentFields = [
  {
    name: 'installment_percent',
    label: 'Installment Percent',
    type: 'number',
    icon: 'pi pi-percentage',
    validation: { required: true, min: 0, max: 100 }
  },
  {
    name: 'installment_rate',
    label: 'Installment Rate',
    type: 'currency',
    validation: { required: true }
  }
]

// Combine field handling
const handleEdit = (fieldName, currentValue, title) => {
  // Find the field definition in any of the field arrays
  const allFields = [...listingFields]
  const fieldDef = allFields.find(field => field.name === fieldName) || {}
  
  // Emit edit event with all needed info
  emit('edit-field', {
    fieldName,
    currentValue,
    title,
    type: fieldDef.type || 'text',
    options: fieldDef.options || [],
    validation: fieldDef.validation || null,
    doctype: fieldDef.doctype || ''
  })
}

// Methods for Offers
const addOffer = (newOffer) => {
  const updatedListing = { ...props.listing }
  updatedListing.offers = [...(updatedListing.offers || []), newOffer]
  emit('update:listing', updatedListing)
}

const updateOffer = ({ index, data }) => {
  const updatedListing = { ...props.listing }
  updatedListing.offers = [...(updatedListing.offers || [])]
  updatedListing.offers[index] = data
  emit('update:listing', updatedListing)
}

const deleteOffer = (index) => {
  const updatedListing = { ...props.listing }
  updatedListing.offers = [...(updatedListing.offers || [])]
  updatedListing.offers.splice(index, 1)
  emit('update:listing', updatedListing)
}

// Methods for Installments
const addInstallment = (newInstallment) => {
  const updatedListing = { ...props.listing }
  updatedListing.installments = [...(updatedListing.installments || []), newInstallment]
  emit('update:listing', updatedListing)
}

const updateInstallment = ({ index, data }) => {
  const updatedListing = { ...props.listing }
  updatedListing.installments = [...(updatedListing.installments || [])]
  updatedListing.installments[index] = data
  emit('update:listing', updatedListing)
}

const deleteInstallment = (index) => {
  const updatedListing = { ...props.listing }
  updatedListing.installments = [...(updatedListing.installments || [])]
  updatedListing.installments.splice(index, 1)
  emit('update:listing', updatedListing)
}
</script>