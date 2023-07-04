import { GlobalRegistry } from '@designable/core'
import { Field, observer, useField } from '@formily/react'
import { Input } from 'antd'
import { Select } from '@formily/antd'
import React from 'react'
import { Field as FieldType } from '@formily/core'
import { usePrefix } from '@designable/react'
import cls from 'classnames'
import { FormItem } from '@formily/antd'

interface IFieldTypeSetterProps {
  className?: string
  value?: any
  onChange?: (value: any) => void
}

export const FieldTypeSetter: React.FC<IFieldTypeSetterProps> = observer(
  (props) => {
    const field = useField<FieldType>()
    const prefix = usePrefix('flex-style-setter')
    return (
      <>
        <FormItem.BaseItem
          label={field.title}
          className={cls(prefix, props.className)}
          tooltip={field.description}
        >
          <Select
            value={props.value}
            onChange={props.onChange}
            options={GlobalRegistry.getDesignerMessage(
              'SettingComponents.FieldTypeSetter.types'
            )}
          />
        </FormItem.BaseItem>

        <Field
          name="x-length"
          decorator={[FormItem]}
          basePath={field.address.parent()}
          component={[Input]}
          title={GlobalRegistry.getDesignerMessage(
            'SettingComponents.FieldTypeSetter.lengthTitle'
          )}
          reactions={(f) => {
            f.visible = field.value === 'string'
          }}
        />
      </>
    )
  }
)
