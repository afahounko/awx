# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2018-07-25 20:06
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Ipam',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ],
        ),
        migrations.CreateModel(
            name='Rir',
            fields=[
                ('ipam_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='ipam.Ipam')),
                ('rir_name', models.CharField(max_length=1024)),
                ('rir_description', models.CharField(max_length=1024)),
            ],
            bases=('ipam.ipam',),
        ),
    ]
